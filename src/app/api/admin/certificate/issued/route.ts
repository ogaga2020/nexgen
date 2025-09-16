import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();

    const filter =
      q.length > 0
        ? {
          $or: [
            { fullName: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
        : {};

    const list = await Certificate.find(filter).sort({ createdAt: -1 }).limit(500).lean();

    const resp = (list || []).map((c: any) => {
      const issuedRaw = c.issuedOn;
      let issuedAt: Date | null = null;

      if (issuedRaw) {
        const d = new Date(issuedRaw);
        if (!isNaN(d.getTime())) {
          if (typeof issuedRaw === "string" && !/(:|T)/.test(issuedRaw)) {
            issuedAt = new Date(c.createdAt);
          } else {
            issuedAt = d;
          }
        }
      }
      if (!issuedAt) issuedAt = new Date(c.createdAt);

      return {
        _id: String(c._id),
        fullName: c.fullName,
        email: c.email,
        course: c.course,
        months: c.months,
        issuedOn: c.issuedOn,
        createdAt: c.createdAt,
        issuedAt: issuedAt.toISOString(),
      };
    });

    return NextResponse.json(resp);
  } catch {
    return NextResponse.json({ error: "failed to load" }, { status: 500 });
  }
}
