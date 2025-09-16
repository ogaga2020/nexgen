import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const email = new URL(req.url).searchParams.get("email")?.toLowerCase().trim();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const u = await User.findOne({ email }).lean<IUser>();
    if (!u) return NextResponse.json({ found: false });

    const course = u.trainingType || "";
    const months = u.trainingDuration?.toString() || "";

    return NextResponse.json({
      found: true,
      user: {
        fullName: u.fullName || "",
        email: u.email,
        phone: u.phone || "",
        course,
        months,
      },
    });
  } catch {
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }
}
