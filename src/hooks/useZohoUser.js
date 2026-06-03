import { useState, useEffect } from 'react';

export function useZohoUser() {
  const [email,   setEmail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    let attempts  = 0;
    const MAX_ATTEMPTS = 20; // 20 × 500ms = 10 seconds max wait

    function tryInit() {
      // Poll until window.ZOHO is fully ready
      const sdkReady =
        typeof ZOHO !== 'undefined' &&
        ZOHO.CREATOR &&
        ZOHO.CREATOR.UTIL &&
        typeof ZOHO.CREATOR.UTIL.getInitParams === 'function';

      if (!sdkReady) {
        if (++attempts < MAX_ATTEMPTS) {
          setTimeout(tryInit, 500);
        } else {
          if (!cancelled) {
            setError('Zoho SDK did not load after 10 seconds');
            setLoading(false);
          }
        }
        return;
      }

      // SDK v2 may not have init() — use it only if present
      const initCall = typeof ZOHO.CREATOR.init === 'function'
        ? ZOHO.CREATOR.init()
        : Promise.resolve();

      initCall
        .then(() => ZOHO.CREATOR.UTIL.getInitParams())
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
            setError(err?.message || 'Failed to get Zoho init params');
            setLoading(false);
          }
        });
    }

    tryInit();
    return () => { cancelled = true; };
  }, []);

  return { email, loading, error };
}
