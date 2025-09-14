'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

type AdminRow = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  lastLoggedIn?: string | null;
};

export default function AdminList() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<AdminRow[]>('/api/admin/list', { params: { t: Date.now() } });
      setAdmins(data || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to load admins', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const fn = () => load();
    window.addEventListener('admins:refresh', fn);
    return () => window.removeEventListener('admins:refresh', fn);
  }, []);

  const formatDateOnly = (v?: string | null) =>
    v ? new Date(v).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const formatDateTime = (v?: string | null) =>
    v ? new Date(v).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">All Admins</h3>
        <button
          onClick={load}
          className="text-sm px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
          disabled={loading}
        >
          {loading ? '...' : 'Refresh'}
        </button>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
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
                <td className="px-4 py-3">{formatDateTime(a.lastLoggedIn || null)}</td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No admins yet.
                </td>
              </tr>
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
            <div className="font-semibold text-gray-900">{a.fullName}</div>
            <div className="mt-2 text-sm text-gray-700 break-words">{a.email}</div>
            <div className="text-sm text-gray-700">{a.phone}</div>
            <div className="mt-2 text-xs text-gray-500">
              <div>Created: {formatDateOnly(a.createdAt)}</div>
              <div>Last login: {formatDateTime(a.lastLoggedIn || null)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
