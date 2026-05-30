// Manages Zoho OAuth access tokens using a refresh token.
// Tokens are cached in memory and auto-refreshed before expiry.

let cache = { token: null, expiresAt: 0 };

export async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cache.token && Date.now() < cache.expiresAt - 60_000) {
    return cache.token;
  }

  const domain  = process.env.ZOHO_DOMAIN || 'zoho.com';
  const tokenUrl = `https://accounts.${domain}/oauth/v2/token`;

  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
  });

  const res  = await fetch(tokenUrl, { method: 'POST', body });
  const json = await res.json();

  if (!json.access_token) {
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(json)}`);
  }

  cache = {
    token:     json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };

  console.log('[zohoAuth] Access token refreshed, expires in', json.expires_in, 's');
  return cache.token;
}
