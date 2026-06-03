import { Router } from 'express';
import { getReportRecords, getFormFields, createRecord } from '../lib/zohoClient.js';
import { buildSubmitPayload } from '../lib/submitMapper.js';
import { generateOTP, verifyOTP } from '../lib/otpStore.js';
import { sendOTPEmail } from '../lib/emailSender.js';
import { log } from '../index.js';

const router = Router();

const SURVEY_REPORT      = process.env.ZOHO_SURVEY_REPORT      || 'State_of_the_Movement_Survey_Report';
const SURVEY_FORM        = process.env.ZOHO_SURVEY_FORM         || 'State_of_the_Movement_Survey';
const GRANT_CYCLE_REPORT = process.env.ZOHO_GRANT_CYCLE_REPORT  || 'Grant_Cycles';
const EMAIL_FIELD        = process.env.ZOHO_EMAIL_FIELD         || 'What_is_your_work_email_address';
const YEAR_FIELD         = process.env.ZOHO_YEAR_FIELD          || 'Current_Year';
const CYCLE_FIELD        = process.env.ZOHO_CYCLE_FIELD         || 'Grant_Cycle';

// Lookup master report names — country and currency are stored in master forms
const COUNTRY_REPORT     = process.env.ZOHO_COUNTRY_REPORT  || 'All_Countries_and_Areas';
const CURRENCY_REPORT    = process.env.ZOHO_CURRENCY_REPORT || 'All_Currency_Masters';

// In-memory cache for lookup IDs (country/currency don't change often)
const lookupCache = { country: {}, currency: {} };

async function resolveLookupId(report, fieldName, displayValue, cacheMap) {
  if (!displayValue) return null;
  if (cacheMap[displayValue]) return cacheMap[displayValue];

  try {
    const resp = await getReportRecords(report, `(${fieldName}=="${displayValue}")`, 1);
    const id   = resp.data?.[0]?.ID || null;
    if (id) {
      cacheMap[displayValue] = id;
      log('info', `[lookup] ${fieldName}="${displayValue}" → ID=${id} (cached)`);
    } else {
      log('warn', `[lookup] ${fieldName}="${displayValue}" → no match in ${report}`);
    }
    return id;
  } catch (err) {
    log('warn', `[lookup] Could not resolve ${fieldName}="${displayValue}": ${err.message}`);
    return null;
  }
}

// ── GET /api/health ──────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  log('info', '[api/health] ping');
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ── GET /api/metadata ────────────────────────────────────────────────────────
router.get('/metadata', async (_req, res) => {
  log('info', `[api/metadata] Fetching fields for form: ${SURVEY_FORM}`);
  try {
    const data = await getFormFields(SURVEY_FORM);
    const fieldCount = data.fields?.length ?? 0;
    log('info', `[api/metadata] Returned ${fieldCount} fields`);
    res.json(data);
  } catch (err) {
    log('error', '[api/metadata] ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/grant-cycles ────────────────────────────────────────────────────
router.get('/grant-cycles', async (_req, res) => {
  log('info', '[api/grant-cycles] Fetching all cycles');
  try {
    const data   = await getReportRecords(GRANT_CYCLE_REPORT, null, 100);
    const cycles = (data.data || []).map(r => ({ id: r.ID, year: r[CYCLE_FIELD] }));
    log('info', `[api/grant-cycles] Found ${cycles.length} cycles: ${cycles.map(c => c.year).join(', ')}`);
    res.json({ cycles });
  } catch (err) {
    log('error', '[api/grant-cycles] ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/previous-response?email=x&year=2024 ────────────────────────────
router.get('/previous-response', async (req, res) => {
  const { email, year } = req.query;

  if (!email) {
    log('warn', '[api/previous-response] Missing email param');
    return res.status(400).json({ error: 'email query param is required' });
  }

  const targetYear = year || String(new Date().getFullYear() - 1);
  log('info', `[api/previous-response] Looking up email=${email} year=${targetYear}`);

  try {
    // Step 1: Resolve year → Grant_Cycle record ID
    log('info', `[api/previous-response] Step 1 — Find Grant_Cycle record for year ${targetYear}`);
    // Grant_Cycle is a Number field — no quotes around the value
    const cycleResp    = await getReportRecords(GRANT_CYCLE_REPORT, `(${CYCLE_FIELD}==${targetYear})`, 1);
    const cycleRecords = cycleResp.data || [];

    if (!cycleRecords.length) {
      log('warn', `[api/previous-response] No Grant_Cycle record for year ${targetYear}`);
      return res.json({ found: false, message: `No grant cycle found for year ${targetYear}` });
    }

    const cycleId = cycleRecords[0].ID;
    log('info', `[api/previous-response] Grant_Cycle ID for ${targetYear} = ${cycleId}`);

    // Step 2: Search survey report by email + year ID
    log('info', `[api/previous-response] Step 2 — Search survey report for email + cycle`);
    // Current_Year is a lookup field — compare by numeric record ID (no quotes, no .ID)
    const surveyResp    = await getReportRecords(
      SURVEY_REPORT,
      `(${EMAIL_FIELD}=="${email}" && ${YEAR_FIELD}==${cycleId})`,
      1
    );
    const surveyRecords = surveyResp.data || [];

    if (!surveyRecords.length) {
      log('info', `[api/previous-response] No previous response found for ${email} / ${targetYear}`);
      return res.json({ found: false, message: `No previous response for ${email} in ${targetYear}` });
    }

    const record = surveyRecords[0];
    log('info', `[api/previous-response] ✅ Found record ID=${record.ID} for ${email} / ${targetYear}`);
    return res.json({ found: true, year: targetYear, record });

  } catch (err) {
    log('error', `[api/previous-response] ERROR for ${email}:`, err.message);
    if (err.stack) log('error', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/send-otp ───────────────────────────────────────────────────────
// Checks if the email has a previous year response. If yes, sends OTP.
// If no previous response, returns hasPreviousResponse: false — no OTP sent.
router.post('/send-otp', async (req, res) => {
  const { email, year } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  const targetYear = year || String(new Date().getFullYear() - 1);
  log('info', `[api/send-otp] Checking previous response for ${email} / ${targetYear}`);

  try {
    // Step 1: Get Grant_Cycle ID
    const cycleResp = await getReportRecords(GRANT_CYCLE_REPORT, `(${CYCLE_FIELD}==${targetYear})`, 1);
    const cycleId   = cycleResp.data?.[0]?.ID;

    if (!cycleId) {
      log('info', `[api/send-otp] No Grant_Cycle for ${targetYear} — no previous response`);
      return res.json({ hasPreviousResponse: false });
    }

    // Step 2: Check if email has a response for this year
    const surveyResp = await getReportRecords(
      SURVEY_REPORT,
      `(${EMAIL_FIELD}=="${email}" && ${YEAR_FIELD}==${cycleId})`,
      1
    );

    if (!surveyResp.data?.length) {
      log('info', `[api/send-otp] No previous response for ${email} — skipping OTP`);
      return res.json({ hasPreviousResponse: false });
    }

    // Previous response exists — generate and send OTP
    const otp = generateOTP(email);
    await sendOTPEmail(email, otp);

    log('info', `[api/send-otp] ✅ OTP sent to ${email} for ${targetYear}`);
    res.json({ hasPreviousResponse: true, otpSent: true });

  } catch (err) {
    log('error', `[api/send-otp] ERROR for ${email}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/verify-otp ─────────────────────────────────────────────────────
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'email and otp are required' });

  const result = verifyOTP(email, otp);
  if (!result.valid) {
    log('warn', `[api/verify-otp] Failed for ${email}: ${result.reason}`);
    return res.status(400).json({ error: result.reason });
  }

  log('info', `[api/verify-otp] ✅ Verified for ${email}`);
  res.json({ verified: true });
});

// ── POST /api/submit ─────────────────────────────────────────────────────────
// Creates a new survey record in Zoho Creator.
router.post('/submit', async (req, res) => {
  const { formData, surveyYear } = req.body;

  if (!formData) {
    return res.status(400).json({ error: 'formData is required' });
  }

  const email = formData.email || 'unknown';
  log('info', `[api/submit] Submitting response for ${email}`);

  try {
    // Resolve the current survey year → Grant_Cycle record ID
    const year = surveyYear || new Date().getFullYear().toString();
    log('info', `[api/submit] Resolving Grant_Cycle ID for year ${year}`);

    const cycleResp = await getReportRecords(GRANT_CYCLE_REPORT, `(${CYCLE_FIELD}==${year})`, 1);
    const cycleId   = cycleResp.data?.[0]?.ID || null;

    if (!cycleId) {
      log('warn', `[api/submit] No Grant_Cycle found for ${year} — submitting without year link`);
    } else {
      log('info', `[api/submit] Grant_Cycle ID for ${year} = ${cycleId}`);
    }

    // Use pre-resolved IDs from formData if available (set during prefill), else resolve now
    let countryId  = formData._countryId  || null;
    let currencyId = formData._currencyId || null;

    if (!countryId || !currencyId) {
      log('info', `[api/submit] Resolving lookups — country="${formData.country}" | currency="${formData.currency}"`);
      const [cId, curId] = await Promise.all([
        !countryId  ? resolveLookupId(COUNTRY_REPORT,  'Country',       formData.country,  lookupCache.country)  : Promise.resolve(countryId),
        !currencyId ? resolveLookupId(CURRENCY_REPORT, 'Currency_Name', formData.currency, lookupCache.currency) : Promise.resolve(currencyId),
      ]);
      countryId  = cId;
      currencyId = curId;
    } else {
      log('info', `[api/submit] Using pre-resolved IDs — country=${countryId} currency=${currencyId}`);
    }

    const enrichedFormData = { ...formData, _countryId: countryId, _currencyId: currencyId };

    // Log raw date for debugging
    log('info', `[api/submit] fiscalYearEnd raw="${formData.fiscalYearEnd}"`);

    // Build Zoho payload from formData
    const payload = buildSubmitPayload(enrichedFormData, cycleId);
    log('info', `[api/submit] Payload built — ${Object.keys(payload.data).length} fields (country=${countryId ?? 'skipped'}, currency=${currencyId ?? 'skipped'})`);

    // Create the record in Zoho Creator
    const result = await createRecord(SURVEY_FORM, payload);

    const recordId = result.data?.ID
      || result.result?.ID
      || result.result?.data?.ID
      || null;
    log('info', `[api/submit] ✅ Record created — ID=${recordId ?? 'check full response above'} for ${email}`);

    res.json({ success: true, recordId, year });

  } catch (err) {
    log('error', `[api/submit] ERROR for ${email}:`, err.message);
    if (err.stack) log('error', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/save-draft ──────────────────────────────────────────────────────
// Saves partial form data to localStorage via response (client stores it).
// No DB needed — client stores JSON, can resume on same device.
// For cross-device: returns a draft token that can be shared via email.
router.post('/save-draft', async (req, res) => {
  const { formData } = req.body;
  if (!formData?.email) {
    return res.status(400).json({ error: 'email is required to save draft' });
  }

  log('info', `[api/save-draft] Saving draft for ${formData.email}`);

  // Draft token = base64(email + timestamp) — used in resume URL
  const token = Buffer.from(`${formData.email}:${Date.now()}`).toString('base64url');
  const resumeUrl = `${req.headers.origin || ''}/?draft=${token}`;

  // Store compressed formData as a string in the response
  // Client also stores this in localStorage
  const draftPayload = JSON.stringify(formData);

  log('info', `[api/save-draft] Draft token generated for ${formData.email}`);
  res.json({
    success:   true,
    token,
    resumeUrl,
    draftData: draftPayload,
    message:   `Draft saved. Resume link: ${resumeUrl}`,
  });
});

export default router;
