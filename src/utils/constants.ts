export const EMAIL_SUBJECTS = {
    ADMIN_CREATED: 'Your NexGen Admin Account',
    OTP_CODE: 'Your OTP Code',
    RESET_SUCCESS: 'Password Reset Successful',
    PAYMENT_RECORDED: 'Payment Recorded',
    WELCOME_VERIFIED: 'Welcome – Your Training Is Confirmed',
    FULLY_PAID_CONGRATS: "Congrats! You're on your way to graduation",
    INSTALLMENT_REMINDER: 'Balance Due in 2 Weeks',
    INSTALLMENT_REMINDER_ADMIN: 'Student Balance Due Soon',
};

export const OTP_EXPIRY_MINUTES = 10;

export const APP_NAME = 'NexGen Flow and Power';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

export const COMPANY_LOGO = `${BASE_URL}/logo.png`;

const ADMIN_LIST = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map(s => s.replace(/["\s]/g, ''))
    .filter(Boolean);

export const MAIN_ADMIN_EMAIL = ADMIN_LIST[0] || 'admin@nexgen.com';
export const ADMIN_EMAILS_TO = ADMIN_LIST.join(',');

export const EMAIL_FROM_NAME = 'NexGen Flow and Power';
