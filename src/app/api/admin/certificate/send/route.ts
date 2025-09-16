import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/email";
import { certificateHtml, certificateEmailBody } from "@/lib/templates";
import { htmlToPdfBuffer } from "@/lib/pdf";
import { EMAIL_SUBJECTS } from "@/utils/constants";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { recipientName, email, phone, course, months, logoUrl } = await req.json();
    if (!recipientName || !email || !course || !months) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const now = new Date();
    const issuedOnISO = now.toISOString();
    const issuedOnDisplay = now.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });

    const attachmentHtml = certificateHtml({
      recipientName,
      recipientEmail: email,
      recipientPhone: phone || "",
      course,
      months,
      issuedOn: issuedOnDisplay,
      logoUrl,
    });

    const emailBodyHtml = certificateEmailBody({
      recipientName,
      course,
      months,
      issuedOn: issuedOnDisplay,
    });

    const pdfUint8Array = await htmlToPdfBuffer(attachmentHtml);
    const pdf = Buffer.from(pdfUint8Array);

    await sendMail({
      to: email,
      subject: `${EMAIL_SUBJECTS.CERTIFICATE_ISSUED} – ${course}`,
      html: emailBodyHtml,
      attachments: [
        {
          filename: "NexGen-Certificate.pdf",
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    await connectDB();
    await Certificate.create({
      fullName: recipientName,
      email,
      course,
      months,
      issuedOn: issuedOnISO,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "send failed" }, { status: 500 });
  }
}
