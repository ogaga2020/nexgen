import { NextResponse } from 'next/server';
import Admin from '@/models/Admin';
import { connectDB } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectDB();
    const admins = await Admin.find({}, 'fullName email phone role createdAt lastLoggedIn')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      admins.map((a: any) => ({
        _id: String(a._id),
        fullName: a.fullName,
        email: a.email,
        phone: a.phone,
        role: a.role,
        createdAt: a.createdAt,
        lastLoggedIn: a.lastLoggedIn || null,
      }))
    );
  } catch {
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}
