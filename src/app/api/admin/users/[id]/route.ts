import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const id = params.id;

    let body: any;
    try {
        body = await _.json();
    } catch {
        return new NextResponse('Invalid JSON body', { status: 400 });
    }

    try {
        const user = await User.findById(id);
        if (!user) return new NextResponse('Not found', { status: 404 });

        const updates: any = {};

        if (typeof body.verificationStatus === 'string') {
            updates.verificationStatus = body.verificationStatus === 'verified' ? 'verified' : 'unverified';
            if (updates.verificationStatus === 'verified' && user.paymentStatus === 'not_paid') {
                updates.paymentStatus = 'partially_paid';
            }
        }

        if (body.markFullyPaid === true || body.paymentStatus === 'fully_paid') {
            updates.paymentStatus = 'fully_paid';
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ ok: true, user });
        }

        const updated = await User.findByIdAndUpdate(id, updates, { new: true });
        logger.info({ route: '/api/admin/users/[id]', phase: 'patched', id, updates });
        return NextResponse.json({ ok: true, user: updated });
    } catch (e: any) {
        logger.error({ route: '/api/admin/users/[id]', phase: 'error', id, message: e?.message });
        return new NextResponse('Server error', { status: 500 });
    }
}
