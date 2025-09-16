import { NextRequest, NextResponse } from "next/server";
import { certificateHtml } from "@/lib/templates";
import { htmlToPdfBuffer } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const html = certificateHtml({
    recipientName: url.searchParams.get("recipientName") || "Recipient Name",
    recipientEmail: url.searchParams.get("email") || "user@example.com",
    recipientPhone: url.searchParams.get("phone") || "",
    course: url.searchParams.get("course") || "Course Title",
    months: url.searchParams.get("months") || "3 months",
    issuedOn:
      url.searchParams.get("issuedOn") ||
      new Date().toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" }),
    logoUrl: url.searchParams.get("logoUrl") || undefined,
  });

  const pdf = await htmlToPdfBuffer(html);

  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "cache-control": "no-store",
      "content-disposition": `inline; filename="certificate.pdf"`,
    },
  });
}
