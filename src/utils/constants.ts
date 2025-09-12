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

export const MAIN_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nexgen.com';

export const EMAIL_FROM_NAME = 'NexGen Flow and Power';
