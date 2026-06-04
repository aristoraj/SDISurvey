import { useState, useEffect } from 'react';

// Race a promise against a timeout
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export function useZohoUser() {
  const [email,   setEmail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    let attempts  = 0;
    const MAX_ATTEMPTS = 10; // 10 × 500ms = 5 seconds max SDK wait

    function tryInit() {
      const sdkReady =
        typeof ZOHO !== 'undefined' &&
        ZOHO.CREATOR &&
        ZOHO.CREATOR.UTIL &&
        typeof ZOHO.CREATOR.UTIL.getInitParams === 'function';

      if (!sdkReady) {
        if (++attempts < MAX_ATTEMPTS) {
          setTimeout(tryInit, 500);
        } else {
          // SDK never ready — not inside Zoho Creator, proceed as public URL
          if (!cancelled) {
            console.log('[useZohoUser] SDK not available — public URL mode');
            setLoading(false);
          }
        }
        return;
      }

      const initCall = typeof ZOHO.CREATOR.init === 'function'
        ? ZOHO.CREATOR.init()
        : Promise.resolve();

      initCall
        // Timeout getInitParams after 3s — it hangs indefinitely on public URL
        // because there's no Zoho Creator parent frame to respond
        .then(() => withTimeout(ZOHO.CREATOR.UTIL.getInitParams(), 3000))
        .then(params => {
          if (cancelled) return;
          const userEmail =
            (params && (params.loginUser || params.loginName || params.email)) || null;
          console.log('[useZohoUser] params:', params, '→ email:', userEmail);
          setEmail(userEmail);
          setLoading(false);
        })
        .catch(err => {
          if (!cancelled) {
            // Timeout or error → not actually inside Zoho Creator widget
            console.log('[useZohoUser] getInitParams failed/timed out — public URL mode:', err?.message);
            setEmail(null);
            setLoading(false);
          }
        });
    }

    tryInit();
    return () => { cancelled = true; };
  }, []);

  return { email, loading, error };
}
