import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[email] SMTP not configured — emails will be logged to console only");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@htbconsults.com";
  const transport = createTransport();

  if (!transport) {
    console.log(`\n[EMAIL — not sent, SMTP not configured]\nTo: ${to}\nSubject: ${subject}\n---\n${text || html}\n---\n`);
    return;
  }

  await transport.sendMail({ from, to, subject, html, text });
}

export function buildVerificationEmailHtml(verifyUrl: string, userName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
  <style>
    body { margin: 0; padding: 0; background: #0e2a23; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { background: #0e2a23; padding: 40px 20px; }
    .card { max-width: 520px; margin: 0 auto; background: #162f28; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #e67000, #c85a00); padding: 32px 40px; text-align: center; }
    .header h1 { color: #fff; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 13px; margin: 6px 0 0; }
    .body { padding: 36px 40px; }
    .body p { color: rgba(255,255,255,0.75); font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #e67000, #c85a00); color: #fff;
           text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px;
           font-weight: 600; margin: 8px 0 20px; }
    .url-box { background: #0e2a23; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
               padding: 12px 16px; margin: 0 0 20px; word-break: break-all; }
    .url-box span { color: rgba(255,255,255,0.5); font-size: 12px; font-family: monospace; }
    .footer { border-top: 1px solid rgba(255,255,255,0.08); padding: 20px 40px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.35); font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>HTB Consult Academy</h1>
        <p>Account Verification</p>
      </div>
      <div class="body">
        <p>Hi ${userName || "there"},</p>
        <p>Welcome to HTB Consult Academy! To activate your account and start learning, please verify your email address by clicking the button below. This link expires in <strong style="color:#e67000">24 hours</strong>.</p>
        <p style="text-align:center">
          <a href="${verifyUrl}" class="btn">Verify My Email</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <div class="url-box"><span>${verifyUrl}</span></div>
        <p>If you did not create an account with us, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} HTB Consults. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`.trim();
}

export function buildResetEmailHtml(resetUrl: string, userName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
  <style>
    body { margin: 0; padding: 0; background: #0e2a23; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { background: #0e2a23; padding: 40px 20px; }
    .card { max-width: 520px; margin: 0 auto; background: #162f28; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #e67000, #c85a00); padding: 32px 40px; text-align: center; }
    .header h1 { color: #fff; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 13px; margin: 6px 0 0; }
    .body { padding: 36px 40px; }
    .body p { color: rgba(255,255,255,0.75); font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #e67000, #c85a00); color: #fff;
           text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px;
           font-weight: 600; margin: 8px 0 20px; }
    .url-box { background: #0e2a23; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
               padding: 12px 16px; margin: 0 0 20px; word-break: break-all; }
    .url-box span { color: rgba(255,255,255,0.5); font-size: 12px; font-family: monospace; }
    .footer { border-top: 1px solid rgba(255,255,255,0.08); padding: 20px 40px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.35); font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>HTB Consult Academy</h1>
        <p>Password Reset Request</p>
      </div>
      <div class="body">
        <p>Hi ${userName || "there"},</p>
        <p>We received a request to reset the password for your HTB Consult Academy account. Click the button below to set a new password. This link expires in <strong style="color:#e67000">1 hour</strong>.</p>
        <p style="text-align:center">
          <a href="${resetUrl}" class="btn">Reset My Password</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <div class="url-box"><span>${resetUrl}</span></div>
        <p>If you didn't request a password reset, you can safely ignore this email — your password will not be changed.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} HTB Consults. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`.trim();
}
