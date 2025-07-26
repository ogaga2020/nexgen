import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendMail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        await transporter.sendMail({
            from: `"NexGen Flow and Power" <${process.env.ADMIN_EMAIL}>`,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error('[EMAIL_SEND_ERROR]', error);
        throw new Error('Failed to send email');
    }
}
