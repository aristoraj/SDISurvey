import { Router } from 'express';
import { getReportRecords, getFormFields } from '../lib/zohoClient.js';

const router = Router();

// Config — override via env vars if needed
const SURVEY_REPORT      = process.env.ZOHO_SURVEY_REPORT      || 'State_of_the_Movement_Survey_Report';
const SURVEY_FORM        = process.env.ZOHO_SURVEY_FORM         || 'State_of_the_Movement_Survey';
const GRANT_CYCLE_REPORT = process.env.ZOHO_GRANT_CYCLE_REPORT  || 'All_Grant_Cycle';
const EMAIL_FIELD        = process.env.ZOHO_EMAIL_FIELD         || 'What_is_your_work_email_address';
const YEAR_FIELD         = process.env.ZOHO_YEAR_FIELD          || 'Current_Year';
const CYCLE_FIELD        = process.env.ZOHO_CYCLE_FIELD         || 'Grant_Cycle';

// ── GET /api/health ──────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ── GET /api/metadata ────────────────────────────────────────────────────────
// Returns raw field definitions from the survey form so we can inspect
// Zoho field link names and build our mapping.
router.get('/metadata', async (_req, res) => {
  try {
    const data = await getFormFields(SURVEY_FORM);
    res.json(data);
  } catch (err) {
    console.error('[metadata]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/grant-cycles ────────────────────────────────────────────────────
// Returns [{id, year}] list so the frontend can offer a year selector.
router.get('/grant-cycles', async (_req, res) => {
  try {
    const data   = await getReportRecords(GRANT_CYCLE_REPORT, null, 100);
    const cycles = (data.data || []).map(r => ({
      id:   r.ID,
      year: r[CYCLE_FIELD],
    }));
    res.json({ cycles });
  } catch (err) {
    console.error('[grant-cycles]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/previous-response?email=x&year=2024 ────────────────────────────
// Two-step lookup:
//   1. Find the Grant_Cycle record ID where Grant_Cycle == year
//   2. Find the survey record matching email + Current_Year == that record ID
router.get('/previous-response', async (req, res) => {
  const { email, year } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'email query param is required' });
  }

  // Default to previous calendar year if not specified
  const targetYear = year || String(new Date().getFullYear() - 1);

  try {
    // ── Step 1: Resolve year → Grant_Cycle record ID ─────────────────────────
    const cycleResp    = await getReportRecords(
      GRANT_CYCLE_REPORT,
      `(${CYCLE_FIELD}=="${targetYear}")`,
      1
    );
    const cycleRecords = cycleResp.data || [];

    if (!cycleRecords.length) {
      return res.json({
        found:   false,
        message: `No grant cycle record found for year ${targetYear}`,
      });
    }

    const cycleId = cycleRecords[0].ID;
    console.log(`[previous-response] Grant_Cycle ID for ${targetYear}: ${cycleId}`);

    // ── Step 2: Search survey report by email + year lookup ID ───────────────
    const surveyResp    = await getReportRecords(
      SURVEY_REPORT,
      `(${EMAIL_FIELD}=="${email}" && ${YEAR_FIELD}=="${cycleId}")`,
      1
    );
    const surveyRecords = surveyResp.data || [];

    if (!surveyRecords.length) {
      return res.json({
        found:   false,
        message: `No previous response for ${email} in ${targetYear}`,
      });
    }

    const record = surveyRecords[0];
    console.log(`[previous-response] Found record ${record.ID} for ${email} / ${targetYear}`);

    return res.json({
      found:  true,
      year:   targetYear,
      record, // raw Zoho record — frontend maps fields to hints
    });

  } catch (err) {
    console.error('[previous-response]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
