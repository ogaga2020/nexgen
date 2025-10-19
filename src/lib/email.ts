import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import logger from '@/lib/logger';
import { EMAIL_FROM_NAME } from '@/utils/constants';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendMail({
    to,
    subject,
    html,
    attachments,
}: {
    to: string | string[];
    subject: string;
    html: string;
    attachments?: Mail.Attachment[];
}) {
    const toField = Array.isArray(to) ? to.join(',') : to;
    try {
        await transporter.sendMail({
            from: `"${EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
            to: toField,
            subject,
            html,
            ...(attachments && { attachments }),
        });
        logger.info({ route: 'lib/email.sendMail', to: toField, subject, ok: true });
    } catch (error: any) {
        logger.error({ route: 'lib/email.sendMail', to: toField, subject, error: error?.message });
        throw new Error('Failed to send email');
    }
}
