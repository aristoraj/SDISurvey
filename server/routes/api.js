import { Router } from 'express';
import { getReportRecords, getFormFields } from '../lib/zohoClient.js';
import { log } from '../index.js';

const router = Router();

const SURVEY_REPORT      = process.env.ZOHO_SURVEY_REPORT      || 'State_of_the_Movement_Survey_Report';
const SURVEY_FORM        = process.env.ZOHO_SURVEY_FORM         || 'State_of_the_Movement_Survey';
const GRANT_CYCLE_REPORT = process.env.ZOHO_GRANT_CYCLE_REPORT  || 'All_Grant_Cycle';
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
    const cycleResp    = await getReportRecords(GRANT_CYCLE_REPORT, `(${CYCLE_FIELD}=="${targetYear}")`, 1);
    const cycleRecords = cycleResp.data || [];

    if (!cycleRecords.length) {
      log('warn', `[api/previous-response] No Grant_Cycle record for year ${targetYear}`);
      return res.json({ found: false, message: `No grant cycle found for year ${targetYear}` });
    }

    const cycleId = cycleRecords[0].ID;
    log('info', `[api/previous-response] Grant_Cycle ID for ${targetYear} = ${cycleId}`);

    // Step 2: Search survey report by email + year ID
    log('info', `[api/previous-response] Step 2 — Search survey report for email + cycle`);
    const surveyResp    = await getReportRecords(
      SURVEY_REPORT,
      `(${EMAIL_FIELD}=="${email}" && ${YEAR_FIELD}=="${cycleId}")`,
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

export default router;
