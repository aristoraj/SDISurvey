import { getAccessToken } from './zohoAuth.js';
import { log } from '../index.js';

const OWNER  = process.env.ZOHO_OWNER  || 'straydoginstitute';
const APP    = process.env.ZOHO_APP    || 'stray-dog-institute';
const DOMAIN = process.env.ZOHO_DOMAIN || 'zoho.com';
const BASE   = `https://creator.${DOMAIN}/api/v2/${OWNER}/${APP}`;

async function zohoGet(path, params = {}) {
  const token = await getAccessToken();
  const url   = new URL(`${BASE}${path}`);

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }

  log('info', `[zohoClient] GET ${url.pathname}${url.search}`);
  const start = Date.now();

  const res = await fetch(url.toString(), {
    headers: {
      Authorization:  `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const ms   = Date.now() - start;
  const text = await res.text();

  if (!res.ok) {
    log('error', `[zohoClient] ${res.status} ${url.pathname} (${ms}ms) — ${text}`);
    throw new Error(`Zoho API ${res.status} at ${path}: ${text}`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    log('error', `[zohoClient] Non-JSON response at ${path}: ${text}`);
    throw new Error(`Zoho API non-JSON response at ${path}`);
  }

  const count = Array.isArray(json.data) ? `${json.data.length} records` : 'ok';
  log('info', `[zohoClient] ${res.status} ${url.pathname} (${ms}ms) — ${count}`);
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
