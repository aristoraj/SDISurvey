const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Fetch previous year's survey response for a given email
// Returns { found: bool, year: string, record: {} } or { found: false }
export async function fetchPreviousResponse(email, year) {
  if (!email || !email.includes('@')) return null;

  try {
    const params = new URLSearchParams({ email });
    if (year) params.set('year', year);

    const res = await fetch(`${API_URL}/api/previous-response?${params}`, {
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[api] fetchPreviousResponse failed:', err.message);
    return null;
  }
}

// Fetch available grant cycle years [{id, year}]
export async function fetchGrantCycles() {
  try {
    const res = await fetch(`${API_URL}/api/grant-cycles`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.cycles || [];
  } catch (err) {
    console.warn('[api] fetchGrantCycles failed:', err.message);
    return [];
  }
}

// Fetch raw form field metadata (useful for debugging field link names)
export async function fetchMetadata() {
  try {
    const res = await fetch(`${API_URL}/api/metadata`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[api] fetchMetadata failed:', err.message);
    return null;
  }
}
