// filename: src/app/api/admin/list/route.ts
import { NextResponse } from 'next/server';
import Admin from '@/models/Admin';
import { connectDB } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectDB();

    const docs = await Admin.find({}, 'fullName email phone role createdAt lastLoggedIn').lean();

    const norm = docs.map((a: any) => ({
      _id: String(a._id),
      fullName: a.fullName,
      email: a.email,
      phone: a.phone,
      role: a.role,
      createdAt: a.createdAt,
      lastLoggedIn: a.lastLoggedIn || null,
    }));

    const superadmins = norm.filter((a) => a.role === 'superadmin');
    const editors = norm
      .filter((a) => a.role !== 'superadmin')
      .sort((a, b) => {
        const ta = a.lastLoggedIn ? new Date(a.lastLoggedIn).getTime() : 0;
        const tb = b.lastLoggedIn ? new Date(b.lastLoggedIn).getTime() : 0;
        if (tb !== ta) return tb - ta;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    const ordered = [...superadmins, ...editors];

    return NextResponse.json(ordered);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}
