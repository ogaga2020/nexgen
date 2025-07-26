export const EMAIL_SUBJECTS = {
    ADMIN_CREATED: 'Your NexGen Admin Account',
    OTP_CODE: 'Your OTP Code',
    RESET_SUCCESS: 'Password Reset Successful',
    PAYMENT_NOTICE: 'New Payment Notification',
    INSTALLMENT_REMINDER: 'Upcoming Balance Reminder',
    INSTALLMENT_REMINDER_ADMIN: 'Student Installment Due Soon'
};

export const OTP_EXPIRY_MINUTES = 10;

export const APP_NAME = 'NexGen Flow and Power';

export const COMPANY_LOGO = `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`;

export const MAIN_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nexgen.com';