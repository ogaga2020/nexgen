import { COMPANY_LOGO } from "@/utils/constants";

const wrapHtml = (content: string) => `
  <div style="font-family: 'Open Sans', sans-serif; padding: 20px; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${COMPANY_LOGO}" alt="NexGen Logo" width="120" />
    </div>
    ${content}
    <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
      NexGen Flow & Power | This is an automated message.
    </p>
  </div>
`;

export const adminAccountCreated = (name: string, email: string, phone: string, password: string) =>
    wrapHtml(`
    <h2 style="color: #1E3A8A;">Admin Account Created</h2>
    <p>Hello ${name},</p>
    <p>Your admin account has been successfully created. You can log in with:</p>
    <ul>
      <li>Email: <strong>${email}</strong></li>
      <li>Password: <strong>${password}</strong></li>
    </ul>
    <p>Please change your password after login.</p>
  `);

export const sendOtpTemplate = (otp: string) =>
    wrapHtml(`
    <h2 style="color: #1E3A8A;">Your Verification Code</h2>
    <p>Use the OTP below to verify your identity:</p>
    <h3 style="font-size: 28px; color: #F59E0B;">${otp}</h3>
    <p>This code is valid for only 10 minutes.</p>
  `);

export const resetSuccessTemplate = () =>
    wrapHtml(`
    <h2 style="color: #1E3A8A;">Password Reset Successful</h2>
    <p>Your password has been reset successfully. You can now log in with your new password.</p>
  `);

export const paymentNotificationTemplate = (userName: string, amount: number, program: string, type: string) =>
    wrapHtml(`
    <h2 style="color: #1E3A8A;">Payment Notification</h2>
    <p>${userName} has just completed a <strong>${type}</strong> payment of <strong>₦${amount.toLocaleString()}</strong> for the <strong>${program}</strong> program.</p>
  `);

export const installmentReminderTemplate = (name: string, program: string, endDate: string) =>
    wrapHtml(`
    <h2 style="color: #1E3A8A;">Installment Balance Reminder</h2>
    <p>Hello ${name},</p>
    <p>This is a reminder that your remaining installment for the <strong>${program}</strong> program is due before <strong>${endDate}</strong>.</p>
    <p>Please ensure your balance is settled to complete your training smoothly.</p>
  `);

export const installmentReminderAdmin = (name: string, program: string, endDate: string) =>
    wrapHtml(`
    <h2 style="color: #1E3A8A;">Student Balance Reminder</h2>
    <p>This is to notify you that <strong>${name}</strong> (in the ${program} program) is due to complete their training on <strong>${endDate}</strong> and may still have a pending installment.</p>
  `);
