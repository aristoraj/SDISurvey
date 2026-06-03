import { Router } from 'express';
import { getReportRecords, getFormFields, createRecord } from '../lib/zohoClient.js';
import { buildSubmitPayload } from '../lib/submitMapper.js';
import { log } from '../index.js';

const router = Router();

const SURVEY_REPORT      = process.env.ZOHO_SURVEY_REPORT      || 'State_of_the_Movement_Survey_Report';
const SURVEY_FORM        = process.env.ZOHO_SURVEY_FORM         || 'State_of_the_Movement_Survey';
const GRANT_CYCLE_REPORT = process.env.ZOHO_GRANT_CYCLE_REPORT  || 'Grant_Cycles';
const EMAIL_FIELD        = process.env.ZOHO_EMAIL_FIELD         || 'What_is_your_work_email_address';
const YEAR_FIELD         = process.env.ZOHO_YEAR_FIELD          || 'Current_Year';
const CYCLE_FIELD        = process.env.ZOHO_CYCLE_FIELD         || 'Grant_Cycle';

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

    // Build Zoho payload from formData
    const payload = buildSubmitPayload(formData, cycleId);
    log('info', `[api/submit] Payload built — ${Object.keys(payload.data).length} fields`);

    // Create the record in Zoho Creator
    const result = await createRecord(SURVEY_FORM, payload);

    const recordId = result.data?.ID || result.result?.ID || null;
    log('info', `[api/submit] ✅ Record created — ID=${recordId} for ${email}`);

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
