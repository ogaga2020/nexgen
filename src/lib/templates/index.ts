import { COMPANY_LOGO, APP_NAME, BASE_URL } from "@/utils/constants";

const wrap = (content: string) => `
  <div style="font-family: 'Inter', -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding:24px; max-width:640px; margin:0 auto; background:#f7fdfa; border-radius:12px; color:#0b3b2e;">
    <div style="text-align:center; margin-bottom:18px;">
      <img src="${COMPANY_LOGO}" alt="${APP_NAME}" width="120" style="display:inline-block;"/>
    </div>
    ${content}
    <p style="margin-top:28px; font-size:12px; color:#64748b; text-align:center;">${APP_NAME}</p>
  </div>
`;

const btn = (href: string, label: string) => `
  <a href="${href}" style="display:inline-block; background:#065f46; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:8px; font-weight:600;">
    ${label}
  </a>
`;


export const adminAccountCreated = (name: string, email: string, phone: string) =>
  wrap(`
    <h2 style="color:#065f46; margin:0 0 12px;">Admin Account Created</h2>
    <p style="margin:0 0 10px;">Hello ${name}, your administrator account is ready.</p>
    <div style="margin:14px 0; padding:12px; background:#e7f7f1; border:1px solid #c5eedf; border-radius:8px;">
      <p style="margin:0; line-height:1.6;">
        <strong>Email:</strong> ${email}<br/>
        <strong>Phone:</strong> ${phone}
      </p>
    </div>
    <div style="margin-top:16px;">${btn(`${BASE_URL}/admin`, "Go to Admin Login")}</div>
  `);

export const sendOtpTemplate = (otp: string) =>
  wrap(`
    <h2 style="color:#065f46; margin:0 0 12px;">Verification Code</h2>
    <p style="margin:0 0 10px;">Use the code below to continue:</p>
    <div style="margin:14px 0; padding:14px; border:1px dashed #10b981; border-radius:10px; background:#f0fdf4; text-align:center;">
      <span style="font-size:28px; letter-spacing:4px; font-weight:700; color:#10b981;">${otp}</span>
    </div>
    <p style="margin:0;">This code expires in <strong>10 minutes</strong>.</p>
  `);

export const resetSuccessTemplate = () =>
  wrap(`
    <h2 style="color:#065f46; margin:0 0 12px;">Password Reset Successful</h2>
    <p style="margin:0 0 10px;">You can now sign in with your new password.</p>
    <div style="margin-top:16px;">${btn(`${BASE_URL}/admin`, "Sign In")}</div>
  `);


export const paymentRecordedTemplate = (student: string, amount: number, program: string, kind: "Initial" | "Balance") =>
  wrap(`
    <h2 style="color:#065f46; margin:0 0 12px;">Payment Recorded</h2>
    <p style="margin:0 0 10px;">A ${kind.toLowerCase()} payment has been recorded.</p>
    <div style="margin:14px 0; padding:12px; background:#e7f7f1; border:1px solid #c5eedf; border-radius:8px;">
      <p style="margin:0; line-height:1.7;">
        <strong>Student:</strong> ${student}<br/>
        <strong>Amount:</strong> ₦${amount.toLocaleString()}<br/>
        <strong>Programme:</strong> ${program}<br/>
        <strong>Type:</strong> ${kind}
      </p>
    </div>
  `);

export const welcomeAfterVerificationTemplate = (
  name: string,
  program: string,
  durationMonths: number,
  startDateStr: string,
  balanceDueStr: string
) =>
  wrap(`
    <h2 style="color:#065f46; margin:0 0 12px;">Welcome to NexGen</h2>
    <p style="margin:0 0 10px;">Hello ${name}, your registration has been verified and your training is confirmed.</p>
    <div style="margin:14px 0; padding:12px; background:#ecfeff; border:1px solid #bae6fd; border-radius:8px;">
      <p style="margin:0; line-height:1.7;">
        <strong>Programme:</strong> ${program}<br/>
        <strong>Duration:</strong> ${durationMonths} months<br/>
        <strong>Start Date:</strong> ${startDateStr}<br/>
        <strong>Balance Due:</strong> ${balanceDueStr}
      </p>
    </div>
    <p style="margin:0 0 10px;">Please ensure your remaining 40% tuition is paid on or before the date above.</p>
    <p style="margin:0;">We’re excited to have you on board!</p>
  `);

export const twoWeeksToFinishReminderTemplate = (
  name: string,
  program: string,
  dueStr: string
) =>
  wrap(`
    <h2 style="color:#065f46; margin:0 0 12px;">Balance Due in 2 Weeks</h2>
    <p style="margin:0 0 10px;">Hello ${name}, this is a reminder that your remaining 40% for <strong>${program}</strong> is due in two weeks.</p>
    <p style="margin:0 0 10px;">Please complete your payment on or before <strong>${dueStr}</strong>.</p>
    <p style="margin:0;">If you’ve already paid, kindly ignore this message.</p>
  `);

export const adminTwoWeeksReminderTemplate = (student: string, program: string, dueStr: string) =>
  wrap(`
    <h2 style="color:#065f46; margin:0 0 12px;">Student Balance Due (2 Weeks)</h2>
    <p style="margin:0 0 10px;"><strong>${student}</strong> in <strong>${program}</strong> has a balance due by <strong>${dueStr}</strong>.</p>
    <p style="margin:0;">Please follow up and update records after confirmation.</p>
  `);


export const fullyPaidCongratulationsTemplate = (name: string, program: string) =>
(`
    <div style="font-family: 'Inter', -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding:24px; max-width:640px; margin:0 auto; background:#f7fdfa; border-radius:12px; color:#0b3b2e;">
      <div style="text-align:center; margin-bottom:18px;">
        <img src="${COMPANY_LOGO}" alt="${APP_NAME}" width="120" style="display:inline-block;"/>
      </div>
      <h2 style="color:#065f46; margin:0 0 12px;">Congratulations!</h2>
      <p style="margin:0 0 10px;">Hello ${name},</p>
      <p style="margin:0 0 10px;">Your fees for <strong>${program}</strong> have been fully paid. 🎉</p>
      <p style="margin:0;">Thank you for completing your payments. We wish you a successful training completion and graduation.</p>
      <p style="margin-top:28px; font-size:12px; color:#64748b; text-align:center;">${APP_NAME}</p>
    </div>
  `);
