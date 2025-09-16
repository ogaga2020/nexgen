export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getCurrentAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminNavbar from '@/components/AdminNavbar';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentAdmin();
  if (!me) redirect('/admin');
  return (
    <>
      <AdminNavbar />
      <main className="p-4">{children}</main>
    </>
  );
}
