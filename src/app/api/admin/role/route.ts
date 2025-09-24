import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { getCurrentAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  adminId: z.string().min(1),
  role: z.enum(['superadmin', 'editor']),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const me = await getCurrentAdmin();
    if (!me) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    if (me.role !== 'superadmin') {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 });
    }

    const { adminId, role } = BodySchema.parse(await req.json().catch(() => ({})));
    const target = await Admin.findById(adminId);
    if (!target) return NextResponse.json({ ok: false, message: 'Admin not found' }, { status: 404 });

    if (target.role === 'superadmin' && role === 'editor') {
      const supCount = await Admin.countDocuments({ role: 'superadmin' });
      if (supCount <= 1) {
        return NextResponse.json({ ok: false, message: 'Cannot demote the last superadmin' }, { status: 409 });
      }
    }

    target.role = role;
    await target.save();

    return NextResponse.json({ ok: true, message: `Role updated to ${role}` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Failed to update role' }, { status: 500 });
  }
}
