'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

type AdminRow = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'superadmin' | 'editor';
  createdAt: string;
  lastLoggedIn?: string | null;
};

export default function AdminList() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [meRole, setMeRole] = useState<'superadmin' | 'editor' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const meRes = await axios.get('/api/admin/me').catch(() => ({ data: { ok: false } }));
      if (meRes.data?.ok) setMeRole(meRes.data.me.role);
      const { data } = await axios.get<AdminRow[]>('/api/admin/list', { params: { t: Date.now() } });
      setAdmins(data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to load admins', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const fn = () => load();
    window.addEventListener('admins:refresh', fn);
    return () => window.removeEventListener('admins:refresh', fn);
  }, []);

  const promote = async () => {
    if (!selectedAdmin) return toast.error('Select an admin to promote');
    try {
      const { data } = await axios.post('/api/admin/role', { adminId: selectedAdmin, role: 'superadmin' });
      if (!data?.ok) throw new Error(data?.message || 'Failed');
      toast.success(data.message || 'Promoted');
      setShowModal(false);
      setSelectedAdmin('');
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to promote', { duration: 5000 });
    }
  };

  const RoleBadge = ({ role }: { role: AdminRow['role'] }) => (
    <span className={role === 'superadmin'
      ? 'inline-block text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700'
      : 'inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700'}>
      {role}
    </span>
  );

  const formatDateOnly = (v?: string | null) =>
    v ? new Date(v).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const formatDateTime = (v?: string | null) =>
    v ? new Date(v).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

  const editors = admins.filter((a) => a.role === 'editor');

  return (
    <div className="bg-white border rounded-lg shadow-sm relative">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">All Admins</h3>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="text-sm px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? '...' : 'Refresh'}
          </button>
          {meRole === 'superadmin' && (
            <button
              onClick={() => setShowModal(true)}
              className="text-sm px-3 py-1 rounded-md border bg-purple-600 text-white hover:bg-purple-700"
            >
              Promote
            </button>
          )}
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a._id} className="border-t">
                <td className="px-4 py-3">{formatDateOnly(a.createdAt)}</td>
                <td className="px-4 py-3">{a.fullName}</td>
                <td className="px-4 py-3">{a.email}</td>
                <td className="px-4 py-3">{a.phone}</td>
                <td className="px-4 py-3"><RoleBadge role={a.role} /></td>
                <td className="px-4 py-3">{formatDateTime(a.lastLoggedIn)}</td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">No admins yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y">
        {admins.length === 0 && (
          <div className="px-4 py-10 text-center text-gray-500">No admins yet.</div>
        )}
        {admins.map((a) => (
          <div key={a._id} className="p-4">
            <div className="font-semibold text-gray-900 flex items-center justify-between">
              {a.fullName}
              <RoleBadge role={a.role} />
            </div>
            <div className="mt-2 text-sm text-gray-700 break-words">{a.email}</div>
            <div className="text-sm text-gray-700">{a.phone}</div>
            <div className="mt-2 text-xs text-gray-500">
              <div>Created: {formatDateOnly(a.createdAt)}</div>
              <div>Last login: {formatDateTime(a.lastLoggedIn || null)}</div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Promote Admin</h2>
            <p className="text-sm text-gray-600 mb-3">Select an editor to promote to superadmin:</p>
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="w-full border rounded-md p-2 mb-4"
            >
              <option value="">-- Select an editor --</option>
              {editors.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.fullName} (Created: {formatDateOnly(e.createdAt)})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md border bg-gray-50 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={promote}
                disabled={!selectedAdmin}
                className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
              >
                Promote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
