import nodemailer from "nodemailer";
import logger from "@/lib/logger";
import { MAIN_ADMIN_EMAIL, EMAIL_FROM_NAME } from "@/utils/constants";

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
            from: `"${EMAIL_FROM_NAME}" <${MAIN_ADMIN_EMAIL}>`,
            to,
            subject,
            html,
        });
        logger.info({ route: "lib/email.sendMail", to, subject, ok: true });
    } catch (error: any) {
        logger.error({ route: "lib/email.sendMail", to, subject, error: error?.message });
        throw new Error("Failed to send email");
    }
}
