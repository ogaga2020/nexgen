import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';

export const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || '__admin_session';

type AdminOut = { id: string; fullName: string; email: string; role: string };

export async function getCurrentAdmin(): Promise<AdminOut | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value || '';
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    await connectDB();
    const admin = await Admin.findById(decoded.id).select('_id fullName email role');
    if (!admin) return null;

    return {
      id: String(admin._id),
      fullName: admin.fullName || '',
      email: admin.email,
      role: admin.role,
    };
  } catch {
    return null;
  }
}
