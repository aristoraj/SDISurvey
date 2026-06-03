/**
 * Zoho OAuth token management.
 *
 * How it works:
 *  - Access tokens expire every 3600s (1 hour)
 *  - Refresh tokens never expire (unless revoked or wrong scope)
 *  - Every API call goes through getAccessToken() which:
 *      1. Returns cached token if still valid (with 60s buffer)
 *      2. Automatically fetches a new one using the refresh token if expired
 *  - No manual intervention needed for normal operation
 *
 * What DOES require manual action:
 *  - Refresh token has wrong scopes (code 2945) → regenerate with full scopes
 *  - Refresh token revoked → regenerate from Zoho API Console
 */

import { log } from '../index.js';

let cache = { token: null, expiresAt: 0, refreshCount: 0 };

export async function getAccessToken() {
  const now = Date.now();

  // Return cached token if still valid (60s safety buffer)
  if (cache.token && now < cache.expiresAt - 60_000) {
    const remainingSecs = Math.round((cache.expiresAt - now) / 1000);
    log('info', `[zohoAuth] Using cached token (expires in ${remainingSecs}s, refreshed ${cache.refreshCount} time(s) this session)`);
    return cache.token;
  }

  // Token expired or missing — auto-refresh using refresh token
  log('info', `[zohoAuth] Access token ${cache.token ? 'expired' : 'missing'} — auto-refreshing...`);

  const domain   = process.env.ZOHO_DOMAIN || 'zoho.com';
  const tokenUrl = `https://accounts.${domain}/oauth/v2/token`;

  if (!process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_CLIENT_SECRET || !process.env.ZOHO_REFRESH_TOKEN) {
    throw new Error('Missing Zoho credentials. Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN in environment.');
  }

  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
  });

  const start = Date.now();
  let res, json;

  try {
    res  = await fetch(tokenUrl, { method: 'POST', body });
    json = await res.json();
  } catch (err) {
    throw new Error(`Zoho token endpoint unreachable: ${err.message}`);
  }

  const ms = Date.now() - start;

  // Detect specific error types for clear diagnostics
  if (!json.access_token) {
    if (json.error === 'invalid_client') {
      throw new Error('Invalid Zoho client credentials. Check ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET in Render environment.');
    }
    if (json.error === 'invalid_code' || json.error === 'invalid_token') {
      throw new Error('Refresh token is invalid or expired. Regenerate it from https://api-console.zoho.com/');
    }
    if (json.code === 2945 || json.description?.includes('oauthscope')) {
      throw new Error('Refresh token has insufficient scopes. Regenerate with full scopes (ZohoCreator.report.CREATE etc.) from https://api-console.zoho.com/');
    }
    throw new Error(`Zoho token refresh failed (${ms}ms): ${JSON.stringify(json)}`);
  }

  cache = {
    token:        json.access_token,
    expiresAt:    now + (json.expires_in ?? 3600) * 1000,
    refreshCount: cache.refreshCount + 1,
  };

  log('info', `[zohoAuth] ✅ Token auto-refreshed (${ms}ms) — valid for ${json.expires_in}s — total refreshes this session: ${cache.refreshCount}`);
  return cache.token;
}

// Call on server startup to validate credentials work before first real request
export async function validateTokenOnStartup() {
  log('info', '[zohoAuth] Validating Zoho credentials on startup...');
  try {
    await getAccessToken();
    log('info', '[zohoAuth] ✅ Zoho credentials valid — token ready');
    return true;
  } catch (err) {
    log('error', `[zohoAuth] ❌ Startup credential check FAILED: ${err.message}`);
    log('error', '[zohoAuth] API calls will fail until credentials are fixed in Render environment');
    return false;
  }
}
