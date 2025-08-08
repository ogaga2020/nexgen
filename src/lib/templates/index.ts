import { COMPANY_LOGO } from "@/utils/constants";

const wrapHtml = (content: string) => `
  <div style="font-family: 'Open Sans', Arial, sans-serif; padding: 24px; max-width: 640px; margin: 0 auto; background: #f7fdfa; border-radius: 10px; color: #0b3b2e;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${COMPANY_LOGO}" alt="NexGen Logo" width="120" style="display:inline-block;" />
    </div>
    ${content}
    <p style="margin-top: 28px; font-size: 12px; color: #64748b; text-align: center;">
      NexGen Flow & Power
    </p>
  </div>
`;

const ctaButton = (href: string, label: string) => `
  <a href="${href}" style="display:inline-block; background:#065f46; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:8px; font-weight:600;">
    ${label}
  </a>
`;

export const adminAccountCreated = (name: string, email: string, phone: string, _password?: string) =>
  wrapHtml(`
    <h2 style="color:#065f46; margin:0 0 12px;">Admin Account Created</h2>
    <p style="margin:0 0 10px;">Hello ${name},</p>
    <p style="margin:0 0 10px;">
      Your administrator account for <strong>NexGen Flow & Power</strong> has been created successfully.
    </p>
    <div style="margin:16px 0; padding:12px 14px; background:#e7f7f1; border:1px solid #c5eedf; border-radius:8px;">
      <p style="margin:0; line-height:1.6;">
        <strong>Email:</strong> ${email}<br/>
        <strong>Phone:</strong> ${phone}
      </p>
    </div>
    <p style="margin:0 0 16px;">
      For security reasons, your password is not included in this email. If this is your first time accessing the dashboard, please use the credentials you set during account creation. If you have difficulties signing in, you can reset your password using the link below.
    </p>
    <div style="margin:18px 0 6px;">
      ${ctaButton(process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin` : '/admin', 'Go to Admin Login')}
    </div>
    <p style="margin:10px 0 0; font-size:13px; color:#334155;">
      If you did not request this account, please contact the NexGen support team immediately.
    </p>
  `);

export const sendOtpTemplate = (otp: string) =>
  wrapHtml(`
    <h2 style="color:#065f46; margin:0 0 12px;">Verification Code</h2>
    <p style="margin:0 0 10px;">Use the one-time code below to complete your verification:</p>
    <div style="margin:14px 0; padding:14px; border:1px dashed #10b981; border-radius:10px; background:#f0fdf4; text-align:center;">
      <span style="font-size:28px; letter-spacing:4px; font-weight:700; color:#10b981;">${otp}</span>
    </div>
    <p style="margin:0 0 10px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <p style="margin:0;">If you didn’t request this code, you can safely ignore this message.</p>
  `);

export const resetSuccessTemplate = () =>
  wrapHtml(`
    <h2 style="color:#065f46; margin:0 0 12px;">Password Reset Successful</h2>
    <p style="margin:0 0 10px;">Your password has been updated.</p>
    <p style="margin:0 0 16px;">You can now sign in to your dashboard using your new credentials.</p>
    <div style="margin:18px 0 6px;">
      ${ctaButton(process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin` : '/admin', 'Sign In')}
    </div>
  `);

export const paymentNotificationTemplate = (userName: string, amount: number, program: string, type: string) =>
  wrapHtml(`
    <h2 style="color:#065f46; margin:0 0 12px;">Payment Notification</h2>
    <p style="margin:0 0 10px;">
      A ${type.toLowerCase()} payment has been recorded for the <strong>${program}</strong> program.
    </p>
    <div style="margin:16px 0; padding:12px 14px; background:#e7f7f1; border:1px solid #c5eedf; border-radius:8px;">
      <p style="margin:0; line-height:1.6;">
        <strong>Student:</strong> ${userName}<br/>
        <strong>Amount:</strong> ₦${amount.toLocaleString()}<br/>
        <strong>Program:</strong> ${program}<br/>
        <strong>Payment Type:</strong> ${type}
      </p>
    </div>
    <p style="margin:0;">You can review this transaction in the admin dashboard.</p>
  `);

export const installmentReminderTemplate = (name: string, program: string, endDate: string) =>
  wrapHtml(`
    <h2 style="color:#065f46; margin:0 0 12px;">Installment Balance Reminder</h2>
    <p style="margin:0 0 10px;">Hello ${name},</p>
    <p style="margin:0 0 10px;">
      This is a friendly reminder of your outstanding installment for the <strong>${program}</strong> program.
      Please ensure your balance is settled on or before <strong>${endDate}</strong> to avoid any interruption to your training.
    </p>
    <p style="margin:0;">If you have already made this payment, kindly disregard this message.</p>
  `);

export const installmentReminderAdmin = (name: string, program: string, endDate: string) =>
  wrapHtml(`
    <h2 style="color:#065f46; margin:0 0 12px;">Student Balance Reminder</h2>
    <p style="margin:0 0 10px;">
      The student <strong>${name}</strong> enrolled in <strong>${program}</strong> has an upcoming balance deadline on <strong>${endDate}</strong>.
    </p>
    <p style="margin:0;">Please follow up as needed and update the record once payment is confirmed.</p>
  `);
