import { log } from '../index.js';

let cache = { token: null, expiresAt: 0 };

export async function getAccessToken() {
  if (cache.token && Date.now() < cache.expiresAt - 60_000) {
    log('info', `[zohoAuth] Using cached token (expires in ${Math.round((cache.expiresAt - Date.now()) / 1000)}s)`);
    return cache.token;
  }

  log('info', '[zohoAuth] Refreshing access token...');

  const domain   = process.env.ZOHO_DOMAIN || 'zoho.com';
  const tokenUrl = `https://accounts.${domain}/oauth/v2/token`;

  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
  });

  const start = Date.now();
  const res   = await fetch(tokenUrl, { method: 'POST', body });
  const json  = await res.json();
  const ms    = Date.now() - start;

  if (!json.access_token) {
    log('error', `[zohoAuth] Token refresh FAILED (${ms}ms):`, JSON.stringify(json));
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(json)}`);
  }

  cache = {
    token:     json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };

  log('info', `[zohoAuth] Token refreshed OK (${ms}ms), expires in ${json.expires_in}s`);
  return cache.token;
}
