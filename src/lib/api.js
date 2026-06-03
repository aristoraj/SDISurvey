// Production: same origin (empty string → relative /api/... calls)
// Local dev: API runs on separate port 3001
const API_URL = import.meta.env.VITE_API_URL
  ?? (import.meta.env.DEV ? 'http://localhost:3001' : '');

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

// Check if email has previous response & send OTP if it does
export async function sendOTP(email, year) {
  const res = await fetch(`${API_URL}/api/send-otp`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, year }),
    signal:  AbortSignal.timeout(15000),
  });
  return await res.json();
}

// Verify OTP entered by user
export async function verifyOTP(email, otp) {
  const res = await fetch(`${API_URL}/api/verify-otp`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, otp }),
    signal:  AbortSignal.timeout(8000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Verification failed');
  return data;
}

// Submit completed survey — creates record in Zoho Creator
export async function submitSurvey(formData, surveyYear) {
  const res = await fetch(`${API_URL}/api/submit`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ formData, surveyYear }),
    signal:  AbortSignal.timeout(20000), // 20s — creation can take a moment
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Submission failed');
  return data;
}

// Save draft and get a resume token
export async function saveDraft(formData) {
  try {
    const res = await fetch(`${API_URL}/api/save-draft`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ formData }),
      signal:  AbortSignal.timeout(8000),
    });
    return await res.json();
  } catch (err) {
    console.warn('[api] saveDraft failed:', err.message);
    return null;
  }
}
