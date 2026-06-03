import { useState, useRef, useEffect } from 'react';
import { verifyOTP, sendOTP } from '../lib/api';

/**
 * OTP verification modal.
 * Shown only when the entered email has a previous year response.
 * User can verify (loads hints) or skip (no hints, fresh response).
 */
export default function OTPModal({ email, year, onVerified, onSkip, tr }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Auto-focus first input on mount
  useEffect(() => { refs[0].current?.focus(); }, []);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function handleDigit(i, val) {
    if (!/^\d*$/.test(val)) return; // digits only
    const next = [...digits];
    next[i] = val.slice(-1); // take last char if paste
    setDigits(next);
    setError('');
    if (val && i < 5) refs[i + 1].current?.focus();
    // Auto-submit when all 6 filled
    if (val && i === 5 && next.every(d => d)) {
      handleVerify(next.join(''));
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split('');
      setDigits(next);
      refs[5].current?.focus();
      handleVerify(pasted);
    }
  }

  async function handleVerify(code) {
    const otp = code || digits.join('');
    if (otp.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    setError('');
    try {
      await verifyOTP(email, otp);
      onVerified();
    } catch (err) {
      setError(err.message || 'Invalid code.');
      setDigits(['', '', '', '', '', '']);
      refs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    try {
      await sendOTP(email, year);
      setDigits(['', '', '', '', '', '']);
      setResendCooldown(60);
      refs[0].current?.focus();
    } catch {
      setError('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 page-transition">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Verify your email</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            We found your <strong>{year}</strong> survey response.<br />
            Enter the 6-digit code sent to
          </p>
          <p className="text-green-700 font-semibold text-sm mt-1">{email}</p>
        </div>

        {/* OTP digit inputs */}
        <div className="flex justify-center gap-2 mb-5" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={loading}
              className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none transition-all ${
                error
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : d
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-800 focus:border-green-500'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm text-center mb-4 font-medium">{error}</p>
        )}

        {/* Verify button */}
        <button
          onClick={() => handleVerify()}
          disabled={loading || digits.some(d => !d)}
          className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying…</>
          ) : (
            <>Verify &amp; load previous responses</>
          )}
        </button>

        {/* Resend */}
        <div className="text-center mt-3">
          {resendCooldown > 0 ? (
            <p className="text-gray-400 text-xs">Resend available in {resendCooldown}s</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-green-600 hover:text-green-700 text-xs font-medium underline"
            >
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </div>

        {/* Skip */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            Skip — continue without previous year data
          </button>
        </div>
      </div>
    </div>
  );
}
