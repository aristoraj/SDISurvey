import { getAccessToken } from './zohoAuth.js';

const OWNER = process.env.ZOHO_OWNER || 'straydoginstitute';
const APP   = process.env.ZOHO_APP   || 'stray-dog-institute';
const DOMAIN = process.env.ZOHO_DOMAIN || 'zoho.com';

const BASE = `https://creator.${DOMAIN}/api/v2/${OWNER}/${APP}`;

async function zohoGet(path, params = {}) {
  const token = await getAccessToken();
  const url   = new URL(`${BASE}${path}`);

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }

  console.log('[zohoClient] GET', url.toString());

  const res = await fetch(url.toString(), {
    headers: {
      Authorization:  `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Zoho API ${res.status} at ${path}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Zoho API non-JSON response at ${path}: ${text}`);
  }
}

// Get records from a report, optional criteria & limit
export async function getReportRecords(reportName, criteria, limit = 10) {
  return zohoGet(`/report/${reportName}`, { criteria, limit });
}

// Get field definitions for a form
export async function getFormFields(formName) {
  return zohoGet(`/form/${formName}/fields`);
}
