/**
 * In-memory OTP store. No database needed for this volume.
 * Each OTP expires in 10 minutes, is single-use, and allows max 3 attempts.
 */

import { log } from '../index.js';

// email (lowercase) → { otp, expiresAt, attempts }
const store = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of store.entries()) {
    if (now > entry.expiresAt) {
      store.delete(email);
      log('info', `[otpStore] Expired OTP cleaned up for ${email}`);
    }
  }
}, 5 * 60 * 1000);

export function generateOTP(email) {
  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
  store.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
    attempts:  0,
  });
  log('info', `[otpStore] OTP generated for ${email} (expires in 10 min)`);
  return otp;
}

export function verifyOTP(email, inputOtp) {
  const key   = email.toLowerCase();
  const entry = store.get(key);

  if (!entry) {
    return { valid: false, reason: 'OTP not found or already expired. Please request a new one.' };
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return { valid: false, reason: 'OTP expired. Please request a new one.' };
  }
  if (entry.attempts >= 3) {
    store.delete(key);
    return { valid: false, reason: 'Too many failed attempts. Please request a new OTP.' };
  }
  if (entry.otp !== String(inputOtp).trim()) {
    entry.attempts++;
    const remaining = 3 - entry.attempts;
    log('warn', `[otpStore] Wrong OTP for ${email} — ${remaining} attempt(s) left`);
    return { valid: false, reason: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` };
  }

  store.delete(key); // one-time use
  log('info', `[otpStore] OTP verified for ${email}`);
  return { valid: true };
}
