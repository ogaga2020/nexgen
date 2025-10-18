import { COMPANY_LOGO, APP_NAME, BASE_URL } from "@/utils/constants";

type Role = "user" | "admin";

type Theme = {
  bg: string;
  text: string;
  heading: string;
  panelBg: string;
  panelBorder: string;
  accent: string;
  dashedBorder: string;
  ctaBg: string;
  ctaText: string;
};

const THEMES: Record<Role, Theme> = {
  admin: {
    bg: "#f0fdf4",
    text: "#064e3b",
    heading: "#065f46",
    panelBg: "#dcfce7",
    panelBorder: "#bbf7d0",
    accent: "#10b981",
    dashedBorder: "#10b981",
    ctaBg: "#065f46",
    ctaText: "#ffffff",
  },
  user: {
    bg: "#eff6ff",
    text: "#1e3a8a",
    heading: "#1d4ed8",
    panelBg: "#dbeafe",
    panelBorder: "#bfdbfe",
    accent: "#3b82f6",
    dashedBorder: "#3b82f6",
    ctaBg: "#1d4ed8",
    ctaText: "#ffffff",
  },
};

const MIXED_CERT_THEME: Theme = {
  bg: "#f7fbff",
  text: "#0b3b2e",
  heading: "#0f766e",
  panelBg: "#e9f7ff",
  panelBorder: "#c4f1de",
  accent: "#0ea5e9",
  dashedBorder: "#10b981",
  ctaBg: "#0f766e",
  ctaText: "#ffffff",
};

const wrapThemed = (content: string, role: Role = "user") => {
  const t = THEMES[role];
  return `
  <div style="font-family:'Inter',-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px;max-width:640px;margin:0 auto;background:${t.bg};border-radius:12px;color:${t.text};">
    <div style="text-align:center;margin-bottom:18px;">
      <img src="${COMPANY_LOGO}" alt="${APP_NAME}" width="120" style="display:inline-block;"/>
    </div>
    <div style="text-align:center;margin-bottom:20px;">
      ${content}
    </div>
    <p style="margin-top:28px;font-size:12px;color:${role === 'admin' ? THEMES.admin.accent : '#64748b'};text-align:center;">${APP_NAME}</p>
  </div>
`;
};

const btn = (href: string, label: string, role: Role = "user") => {
  const t = THEMES[role];
  return `
  <a href="${href}" style="display:inline-block;background:${t.ctaBg};color:${t.ctaText};text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;margin-top:12px;">
    ${label}
  </a>
`;
};


export const adminAccountCreated = (name: string, email: string, phone: string) =>
  wrapThemed(`
    <h2 style="color:${THEMES.admin.heading};margin:0 0 12px;">Admin Account Created</h2>
    <p style="margin:0 0 10px;">Hello ${name}, your administrator account is ready.</p>
    <div style="margin:14px auto;padding:12px;background:${THEMES.admin.panelBg};border:1px solid ${THEMES.admin.panelBorder};border-radius:8px;max-width:360px;text-align:left;">
      <p style="margin:0;line-height:1.6;">
        <strong>Email:</strong> ${email}<br/>
        <strong>Phone:</strong> ${phone}
      </p>
    </div>
    ${btn(`${BASE_URL}/admin`, "Go to Admin Login", "admin")}
  `, "admin");


export const sendOtpTemplate = (otp: string) =>
  wrapThemed(`
    <h2 style="color:${THEMES.admin.heading};margin:0 0 12px;">Verification Code</h2>
    <p style="margin:0 0 10px;">Use the code below to continue:</p>
    <div style="margin:14px auto;padding:14px;border:1px dashed ${THEMES.admin.dashedBorder};border-radius:10px;background:#f0fdf4;text-align:center;max-width:280px;">
      <span style="font-size:28px;letter-spacing:4px;font-weight:700;color:${THEMES.admin.accent};">${otp}</span>
    </div>
    <p style="margin:0;">This code expires in <strong>10 minutes</strong>.</p>
  `, "admin");


export const resetSuccessTemplate = () =>
  wrapThemed(`
    <h2 style="color:${THEMES.admin.heading};margin:0 0 12px;">Password Reset Successful</h2>
    <p style="margin:0 0 10px;">You can now sign in with your new password.</p>
    ${btn(`${BASE_URL}/admin`, "Sign In", "admin")}
    <p style="margin-top:16px;font-size:12px;color:#64748b;">If you did not perform this action, please contact support immediately.</p>
  `, "admin");


export const paymentRecordedTemplate = (
  student: string,
  amount: number,
  program: string,
  kind: "Initial" | "Balance",
  role: Role = "user"
) =>
  wrapThemed(`
    <h2 style="color:${THEMES[role].heading};margin:0 0 12px;">Payment Recorded</h2>
    <p style="margin:0 0 10px;">A ${kind.toLowerCase()} payment has been recorded.</p>
    <div style="margin:14px auto;padding:12px;background:${THEMES[role].panelBg};border:1px solid ${THEMES[role].panelBorder};border-radius:8px;max-width:400px;text-align:left;">
      <p style="margin:0;line-height:1.7;">
        <strong>Student:</strong> ${student}<br/>
        <strong>Amount:</strong> ₦${amount.toLocaleString()}<br/>
        <strong>Programme:</strong> ${program}<br/>
        <strong>Type:</strong> ${kind}
      </p>
    </div>
  `, role);


export const welcomeAfterVerificationTemplate = (
  name: string,
  program: string,
  durationMonths: number,
  startDateStr: string,
  balanceDueStr: string
) =>
  wrapThemed(`
    <h2 style="color:${THEMES.user.heading};margin:0 0 12px;">Welcome to Ogaga Enterprise</h2>
    <p style="margin:0 0 10px;">Hello ${name}, your registration has been verified and your training is confirmed.</p>
    <div style="margin:14px auto;padding:12px;background:#ecfeff;border:1px solid #bae6fd;border-radius:8px;max-width:400px;text-align:left;">
      <p style="margin:0;line-height:1.7;">
        <strong>Programme:</strong> ${program}<br/>
        <strong>Duration:</strong> ${durationMonths} months<br/>
        <strong>Start Date:</strong> ${startDateStr}<br/>
        <strong>Balance Due:</strong> ${balanceDueStr}
      </p>
    </div>
    <p style="margin:0 0 10px;">Please ensure your remaining 40% tuition is paid on or before the date above.</p>
    <p style="margin:0;">We’re excited to have you on board!</p>
  `, "user");


export const twoWeeksToFinishReminderTemplate = (name: string, program: string, dueStr: string) =>
  wrapThemed(`
    <h2 style="color:${THEMES.user.heading};margin:0 0 12px;">Balance Due in 2 Weeks</h2>
    <p style="margin:0 0 10px;">Hello ${name}, this is a reminder that your remaining 40% for <strong>${program}</strong> is due in two weeks.</p>
    <p style="margin:0 0 10px;">Please complete your payment on or before <strong>${dueStr}</strong>.</p>
    <p style="margin:0;">If you’ve already paid, kindly ignore this message.</p>
  `, "user");


export const adminTwoWeeksReminderTemplate = (student: string, program: string, dueStr: string) =>
  wrapThemed(`
    <h2 style="color:${THEMES.admin.heading};margin:0 0 12px;">Student Balance Due (2 Weeks)</h2>
    <p style="margin:0 0 10px;"><strong>${student}</strong> in <strong>${program}</strong> has a balance due by <strong>${dueStr}</strong>.</p>
    <p style="margin:0;">Please follow up and update records after confirmation.</p>
  `, "admin");


export const fullyPaidCongratulationsTemplate = (name: string, program: string) =>
  wrapThemed(`
      <h2 style="color:${THEMES.user.heading};margin:0 0 12px;">Congratulations!</h2>
      <p style="margin:0 0 10px;">Hello ${name},</p>
      <p style="margin:0 0 10px;">Your fees for <strong>${program}</strong> have been fully paid. 🎉</p>
      <p style="margin:0;">Thank you for completing your payments. We wish you a successful training completion and graduation.</p>
  `, "user");


type CertParams = {
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  course: string;
  months: string;
  issuedOn: string;
  logoUrl?: string;
};

export const certificateEmailBody = ({
  recipientName,
  course,
  months,
  issuedOn,
}: {
  recipientName: string;
  course: string;
  months: string;
  issuedOn: string;
}) =>
  wrapThemed(
    `
    <h2 style="color:${THEMES.user.heading};margin:0 0 12px;">Congratulations, ${(recipientName || "").toUpperCase()}!</h2>
    <p style="margin:0 0 10px;">We’re proud to celebrate your successful completion of the <strong>${course}</strong> training program.</p>
    <p style="margin:0 0 10px;">Over the last <strong>${months}</strong>, your commitment, consistency, and hands-on performance stood out. Keep building on this momentum, the future looks bright.</p>
    <div style="margin:14px auto;padding:12px;background:${THEMES.user.panelBg};border:1px solid ${THEMES.user.panelBorder};border-radius:8px;max-width:420px;text-align:left;">
      <p style="margin:0;line-height:1.7;">
        <strong>Programme:</strong> ${course}<br/>
        <strong>Duration:</strong> ${months}<br/>
        <strong>Issued on:</strong> ${issuedOn}
      </p>
    </div>
    <p style="margin:0 0 10px;">Your official certificate is <strong>attached to this email</strong> for download and printing.</p>
    <p style="margin:0;">Congratulations once again from all of us at ${APP_NAME}.</p>
  `,
    "user"
  );


export const certificateHtml = ({
  recipientName,
  course,
  months,
  issuedOn,
  logoUrl,
}: CertParams) => {
  const t = MIXED_CERT_THEME;
  const logo = logoUrl || COMPANY_LOGO;
  const nameUpper = (recipientName || "").toUpperCase();

  return `
  <div style="font-family:'Inter',-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:${t.bg};padding:24px;max-width:820px;margin:0 auto;color:${t.text};">
    <div style="background:#ffffff;border:1px solid ${t.panelBorder};border-radius:16px;padding:28px;box-shadow:0 10px 30px rgba(0,0,0,.06);">
      <div style="text-align:center;margin-bottom:6px;">
        <img src="${logo}" alt="${APP_NAME}" height="56" style="height:56px;"/>
      </div>

      <div style="text-align:center;">
        <div style="color:${t.heading};font-size:26px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px;">Certificate of Completion</div>
        <div style="display:inline-block;margin:8px 0 12px;padding:8px 14px;border-radius:999px;background:${t.panelBg};border:1px dashed ${t.dashedBorder};color:${t.heading};font-weight:600;">Awarded to</div>
        <div style="font-size:30px;font-weight:900;margin:4px 0 2px;letter-spacing:.5px;">${nameUpper}</div>
      </div>

      <p style="margin:16px auto 8px;max-width:640px;line-height:1.7;text-align:center;color:${t.text};">
        This certificate is presented to <strong>${nameUpper}</strong> in recognition of the successful completion of the
        <strong>${course}</strong> training program. Your dedication, consistency, and practical performance throughout the
        ${months} duration have been exemplary. Keep pushing forward, your growth and excellence inspire us.
      </p>

      <div style="height:1px;background:${t.panelBorder};margin:20px 0;"></div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="padding:10px 14px;border-radius:10px;background:${t.panelBg};border:1px solid ${t.panelBorder};font-weight:600;">Course: <span style="color:${t.accent};">${course}</span></div>
        <div style="padding:10px 14px;border-radius:10px;background:${t.panelBg};border:1px solid ${t.panelBorder};font-weight:600;">Duration: <span style="color:${t.accent};">${months}</span></div>
      </div>

      <div style="display:flex;justify-content:space-between;gap:12px;margin-top:22px;align-items:flex-end;">
        <div>
          <div style="font-weight:800;color:${t.heading};">Mr. Ogaga Otaye</div>
          <div style="opacity:.75;font-size:13px;">Chief Executive Officer</div>
          <div style="opacity:.75;font-size:13px;">ogagaotaye@gmail.com</div>
        </div>
        <div style="text-align:right;">
          <div style="opacity:.75;font-size:13px;">Issued on</div>
          <div style="padding:8px 12px;border-radius:10px;background:${t.panelBg};border:1px solid ${t.panelBorder};font-weight:600;">${issuedOn}</div>
        </div>
      </div>
    </div>
  </div>
`;
};
