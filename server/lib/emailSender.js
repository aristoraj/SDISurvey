import nodemailer from 'nodemailer';
import { log } from '../index.js';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.zoho.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email, otp) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  log('info', `[emailSender] Sending OTP to ${email} from ${from}`);

  await transporter.sendMail({
    from,
    to:      email,
    subject: 'Your verification code — 2026 State of the Movement Survey',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="text-align:center;margin-bottom:24px">
          <h2 style="color:#16a34a;margin:0">State of the Movement Survey 2026</h2>
          <p style="color:#6b7280;margin-top:8px">Stray Dog Institute</p>
        </div>

        <p style="color:#374151">
          We found your previous survey response. Enter the code below to load your
          <strong>previous year's responses as reference</strong> while filling this year's survey.
        </p>

        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;
                    padding:24px;text-align:center;margin:24px 0">
          <p style="color:#6b7280;margin:0 0 8px;font-size:13px;text-transform:uppercase;
                    letter-spacing:1px">Your verification code</p>
          <div style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#16a34a">
            ${otp}
          </div>
          <p style="color:#9ca3af;margin:12px 0 0;font-size:12px">
            Expires in <strong>10 minutes</strong>
          </p>
        </div>

        <p style="color:#6b7280;font-size:13px">
          If you didn't request this, you can safely ignore this email —
          you can still fill the survey without seeing previous year data.
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px;text-align:center">
          Stray Dog Institute · surveys@straydoginstitute.org
        </p>
      </div>
    `,
    text: `Your verification code: ${otp}\n\nExpires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
  });

  log('info', `[emailSender] OTP email sent to ${email}`);
}
