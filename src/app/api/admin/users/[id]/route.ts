import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const deleted = await User.findByIdAndDelete(params.id);
        if (!deleted) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('[ADMIN_USER_DELETE_ERROR]', err);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
