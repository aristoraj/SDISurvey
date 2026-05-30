import { getAccessToken } from './zohoAuth.js';
import { log } from '../index.js';

const OWNER  = process.env.ZOHO_OWNER  || 'straydoginstitute';
const APP    = process.env.ZOHO_APP    || 'stray-dog-institute';
// v2.1 API on zohoapis.com (correct base — not creator.zoho.com/api/v2)
const BASE   = `https://www.zohoapis.com/creator/v2.1/data/${OWNER}/${APP}`;

async function zohoGet(path, params = {}) {
  const token = await getAccessToken();

  // Build query string using encodeURIComponent so spaces become %20, not +
  const queryParts = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  const fullUrl = queryParts.length
    ? `${BASE}${path}?${queryParts.join('&')}`
    : `${BASE}${path}`;

  log('info', `[zohoClient] GET ${path}${queryParts.length ? '?' + queryParts.join('&') : ''}`);
  const start = Date.now();

  const res = await fetch(fullUrl, {
    headers: {
      Authorization:  `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const ms   = Date.now() - start;
  const text = await res.text();

  if (!res.ok) {
    log('error', `[zohoClient] ${res.status} ${path} (${ms}ms) — ${text}`);
    throw new Error(`Zoho API ${res.status} at ${path}: ${text}`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    log('error', `[zohoClient] Non-JSON at ${path}: ${text}`);
    throw new Error(`Zoho API non-JSON response at ${path}`);
  }

  const count = Array.isArray(json.data)
    ? `${json.data.length} record(s)`
    : `code=${json.code}`;
  log('info', `[zohoClient] ${res.status} ${path} (${ms}ms) — ${count}`);
  return json;
}

export async function getReportRecords(reportName, criteria, limit = 10) {
  log('info', `[zohoClient] getReportRecords report=${reportName} criteria=${criteria ?? 'none'} limit=${limit}`);
  return zohoGet(`/report/${reportName}`, { criteria, limit });
}

export async function getFormFields(formName) {
  log('info', `[zohoClient] getFormFields form=${formName}`);
  return zohoGet(`/form/${formName}/fields`);
}
