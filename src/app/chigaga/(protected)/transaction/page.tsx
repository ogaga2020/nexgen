'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNotifier } from '@/components/Notifier';
import { FiBookOpen, FiCheckCircle, FiClock, FiCreditCard, FiUser, FiX } from 'react-icons/fi';

type TxUser = { fullName: string; email: string; phone: string };
type Transaction = {
    _id: string;
    userId: string;
    user: TxUser;
    amount: number;
    type: 'initial' | 'balance' | 'total';
    reference: string;
    status: 'success' | 'pending';
    createdAt: string;
};
type Summary = { sumSuccess: number; pending: number; failed: number };
type TxApiResp = { transactions: Transaction[]; summary: Summary; total: number; pageSize: number };

type Audit = {
    user: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        trainingType: 'Electrical' | 'Plumbing' | 'Solar';
        trainingDuration: 4 | 8 | 12;
        paymentStatus: 'not_paid' | 'partially_paid' | 'fully_paid';
        tuition: number;
        expectedInitial: number;
        expectedBalance: number;
        paidTotal: number;
    };
    initial: null | { amount: number; expected: number; status: 'pending' | 'success'; reference: string; date: string };
    balance: null | { amount: number; expected: number; status: 'pending' | 'success'; reference: string; date: string };
};

const money = (value: number) => `₦${value.toLocaleString()}`;
const dateTime = (value?: string) => value ? new Date(value).toLocaleString() : 'Not recorded';

export default function TransactionsPage() {
    const { error } = useNotifier();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary>({ sumSuccess: 0, pending: 0, failed: 0 });
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    const [page, setPage] = useState(1);
    const [month, setMonth] = useState<'all' | string>('all');
    const [status, setStatus] = useState<'all' | 'success' | 'pending'>('all');
    const [tType, setTType] = useState<'all' | 'initial' | 'balance'>('all');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'date' | 'amount'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(false);

    const [auditOpen, setAuditOpen] = useState(false);
    const [auditLoading, setAuditLoading] = useState(false);
    const [audit, setAudit] = useState<Audit | null>(null);

    const months = useMemo((): { label: string; value: string }[] => {
        const list = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
        return [{ label: 'All Months', value: 'all' }, ...list.map((label, i) => ({ label, value: String(i + 1) }))];
    }, []);

    useEffect(() => {
        const h = setTimeout(() => {
            setSearch(searchInput.toLowerCase());
            setPage(1);
        }, 350);
        return () => clearTimeout(h);
    }, [searchInput]);

    const fetchTx = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            if (status !== 'all') params.set('status', status);
            if (tType !== 'all') params.set('type', tType);
            params.set('sortKey', sortKey);
            params.set('sortDir', sortDir);
            if (search.trim()) params.set('search', search.trim());
            if (month !== 'all') params.set('month', month);

            const { data } = await axios.get<TxApiResp>(`/api/admin/transaction?${params.toString()}`, {
                headers: { 'cache-control': 'no-cache' },
            });

            setTransactions(data.transactions || []);
            setSummary(data.summary || { sumSuccess: 0, pending: 0, failed: 0 });
            setTotal(data.total || 0);
            setPageSize(data.pageSize || 20);
        } catch (e: unknown) {
            let msg = 'Failed to fetch transactions';
            if (axios.isAxiosError(e)) msg = (e.response?.data as { error?: string } | undefined)?.error || e.message || msg;
            else if (e instanceof Error) msg = e.message || msg;
            setTransactions([]);
            setSummary({ sumSuccess: 0, pending: 0, failed: 0 });
            setTotal(0);
            error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTx();
    }, [page, month, status, tType, search, sortKey, sortDir]);

    useEffect(() => {
        if (!auditOpen) return;

        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setAuditOpen(false);
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [auditOpen]);

    const exportToExcel = async () => {
        const params = new URLSearchParams();
        params.set('all', '1');
        if (status !== 'all') params.set('status', status);
        if (tType !== 'all') params.set('type', tType);
        params.set('sortKey', sortKey);
        params.set('sortDir', sortDir);
        if (search.trim()) params.set('search', search.trim());
        if (month !== 'all') params.set('month', month);

        const { data } = await axios.get<TxApiResp>(`/api/admin/transaction?${params.toString()}`);
        const list: Transaction[] = data.transactions || [];

        const sheetData = list.map((t) => ({
            Name: t.user.fullName,
            Email: t.user.email,
            Phone: t.user.phone,
            Total: t.amount,
            Status: t.status,
            'Last Reference': t.reference,
            'Last Update': new Date(t.createdAt).toLocaleString(),
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'transactions.xlsx');
    };

    const badge = (st: Transaction['status']) =>
        st === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800';

    const openAudit = async (userId: string) => {
        setAuditOpen(true);
        setAuditLoading(true);
        setAudit(null);
        try {
            const { data } = await axios.get<Audit>(`/api/admin/transaction/audit/${userId}`);
            setAudit(data);
        } catch (e: unknown) {
            let msg = 'Unable to load this payment audit';
            if (axios.isAxiosError(e)) msg = (e.response?.data as { error?: string } | undefined)?.error || e.message || msg;
            error(msg);
            setAuditOpen(false);
        } finally {
            setAuditLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto py-10 px-4">
                <div className="bg-gradient-to-r from-green-800 to-green-500 text-white rounded-md p-6 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold">Transactions</h1>
                    <p className="opacity-90 mt-1">Consolidated per user. View totals and export.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <p className="text-gray-500 text-sm">Successful Amount</p>
                        <p className="text-2xl font-semibold mt-1">₦{summary.sumSuccess.toLocaleString()}</p>
                    </div>
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <p className="text-gray-500 text-sm">Pending Initials</p>
                        <p className="text-2xl font-semibold mt-1">{summary.pending}</p>
                    </div>
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <p className="text-gray-500 text-sm">Total Users</p>
                        <p className="text-2xl font-semibold mt-1">{total}</p>
                    </div>
                </div>

                <div className="bg-white border rounded-xl shadow-sm p-4 mb-6 grid lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2 gap-3 items-end">
                    <div className="lg:col-span-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Name, email, or reference…"
                            className="input-field bg-white w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <select
                            value={month}
                            onChange={(e) => {
                                setMonth(e.target.value);
                                setPage(1);
                            }}
                            className="input-field bg-white w-full"
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as 'all' | 'success' | 'pending');
                                setPage(1);
                            }}
                            className="input-field bg-white w-full"
                        >
                            <option value="all">All</option>
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Include Part</label>
                        <select
                            value={tType}
                            onChange={(e) => {
                                setTType(e.target.value as 'all' | 'initial' | 'balance');
                                setPage(1);
                            }}
                            className="input-field bg-white w-full"
                        >
                            <option value="all">Both (Total)</option>
                            <option value="initial">Initial Only</option>
                            <option value="balance">Balance Only</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                        <div className="flex gap-2">
                            <select
                                value={sortKey}
                                onChange={(e) => {
                                    setSortKey(e.target.value as 'date' | 'amount');
                                    setPage(1);
                                }}
                                className="input-field bg-white"
                            >
                                <option value="date">Last Update</option>
                                <option value="amount">Total Amount</option>
                            </select>
                            <select
                                value={sortDir}
                                onChange={(e) => {
                                    setSortDir(e.target.value as 'asc' | 'desc');
                                    setPage(1);
                                }}
                                className="input-field bg-white"
                            >
                                <option value="desc">Desc</option>
                                <option value="asc">Asc</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full lg:col-start-6 md:col-start-4 sm:col-start-2 sm:flex sm:justify-end">
                        <button
                            onClick={exportToExcel}
                            className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-md"
                        >
                            Export to Excel
                        </button>
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Total Paid</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Last Ref</th>
                                <th className="px-4 py-3">Last Update</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t) => (
                                <tr key={t._id} className="border-t">
                                    <td className="px-4 py-2 text-left">{t.user.fullName}</td>
                                    <td className="px-4 py-2">{t.user.email}</td>
                                    <td className="px-4 py-2">₦{t.amount.toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${badge(t.status)}`}>{t.status}</span>
                                    </td>
                                    <td className="px-4 py-2">{t.reference}</td>
                                    <td className="px-4 py-2">{new Date(t.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => openAudit(t.userId)}
                                            className="px-3 py-1 rounded bg-gray-800 text-white hover:opacity-90"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                                        {loading ? 'Loading…' : 'No transactions found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden space-y-2">
                    {transactions.map((t) => (
                        <div key={t._id} className="rounded-xl border bg-white p-3 flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="font-medium truncate">{t.user.fullName}</p>
                                <p className="text-xs text-gray-500 truncate">{t.user.email}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs">
                                    <span className="font-semibold">₦{t.amount.toLocaleString()}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge(t.status)}`}>{t.status}</span>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Ref: {t.reference}</p>
                                <p className="text-[11px] text-gray-400">{new Date(t.createdAt).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => openAudit(t.userId)}
                                className="ml-3 shrink-0 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm text-white"
                            >
                                View
                            </button>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                        <p className="text-center text-gray-500 py-10">{loading ? 'Loading…' : 'No transactions found.'}</p>
                    )}
                </div>

                {Math.max(1, Math.ceil(total / pageSize)) > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1 rounded ${p === page ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                disabled={loading}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {auditOpen && (
                <div className="admin-audit-overlay" onClick={() => setAuditOpen(false)}>
                    <section className="admin-audit-modal" role="dialog" aria-modal="true" aria-labelledby="payment-audit-title" onClick={(event) => event.stopPropagation()}>
                        <header className="admin-audit-head">
                            <div>
                                <span>Payment record</span>
                                <h2 id="payment-audit-title">Transaction audit</h2>
                            </div>
                            <button type="button" onClick={() => setAuditOpen(false)} aria-label="Close payment audit"><FiX /></button>
                        </header>

                        <div className="admin-audit-body">
                            {auditLoading && (
                                <div className="admin-audit-loading" role="status">
                                    <span />
                                    <strong>Loading payment record</strong>
                                    <small>Retrieving the latest verified details</small>
                                </div>
                            )}

                            {!auditLoading && audit && (
                                <>
                                    <div className="admin-audit-person">
                                        <div className="admin-audit-avatar"><FiUser /></div>
                                        <div>
                                            <span>Student account</span>
                                            <h3>{audit.user.fullName}</h3>
                                            <p>{audit.user.email}</p>
                                        </div>
                                        <span className={`admin-audit-state ${audit.user.paymentStatus}`}>
                                            {audit.user.paymentStatus.replaceAll('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="admin-audit-summary">
                                        <article><FiBookOpen /><span>Programme</span><strong>{audit.user.trainingType}</strong><small>{audit.user.trainingDuration} months</small></article>
                                        <article><FiCreditCard /><span>Total tuition</span><strong>{money(audit.user.tuition)}</strong><small>Agreed programme fee</small></article>
                                        <article><FiCheckCircle /><span>Total received</span><strong>{money(audit.user.paidTotal)}</strong><small>{audit.user.tuition > 0 ? Math.min(100, Math.round((audit.user.paidTotal / audit.user.tuition) * 100)) : 0}% complete</small></article>
                                    </div>

                                    <div className="admin-audit-progress" aria-label="Payment completion">
                                        <div><span>Payment progress</span><strong>{money(Math.max(0, audit.user.tuition - audit.user.paidTotal))} outstanding</strong></div>
                                        <span><i style={{ width: `${audit.user.tuition > 0 ? Math.min(100, (audit.user.paidTotal / audit.user.tuition) * 100) : 0}%` }} /></span>
                                    </div>

                                    <div className="admin-audit-stages">
                                        <article className="admin-audit-stage">
                                            <header>
                                                <div><span>Stage 01</span><h3>Initial payment</h3><small>60% of tuition</small></div>
                                                <span className={audit.initial?.status === 'success' ? 'is-success' : 'is-pending'}>{audit.initial?.status ?? 'Not paid'}</span>
                                            </header>
                                            <div className="admin-audit-money"><span>Received<strong>{audit.initial ? money(audit.initial.amount) : money(0)}</strong></span><span>Expected<strong>{money(audit.initial?.expected ?? audit.user.expectedInitial)}</strong></span></div>
                                            <dl><div><dt>Reference</dt><dd>{audit.initial?.reference ?? 'Not available'}</dd></div><div><dt><FiClock /> Recorded</dt><dd>{dateTime(audit.initial?.date)}</dd></div></dl>
                                        </article>

                                        <article className="admin-audit-stage">
                                            <header>
                                                <div><span>Stage 02</span><h3>Balance payment</h3><small>Remaining 40%</small></div>
                                                <span className={audit.balance?.status === 'success' ? 'is-success' : 'is-pending'}>{audit.balance?.status ?? 'Not paid'}</span>
                                            </header>
                                            <div className="admin-audit-money"><span>Received<strong>{audit.balance ? money(audit.balance.amount) : money(0)}</strong></span><span>Expected<strong>{money(audit.balance?.expected ?? audit.user.expectedBalance)}</strong></span></div>
                                            <dl><div><dt>Reference</dt><dd>{audit.balance?.reference ?? 'Not available'}</dd></div><div><dt><FiClock /> Recorded</dt><dd>{dateTime(audit.balance?.date)}</dd></div></dl>
                                        </article>
                                    </div>

                                    <div className="admin-audit-snapshot">
                                        <span className={audit.user.paymentStatus === 'fully_paid' ? 'is-complete' : ''}><FiCheckCircle /></span>
                                        <div><small>Current snapshot</small><strong>{audit.initial?.status !== 'success' ? 'Initial payment is still pending' : audit.balance?.status !== 'success' ? 'Initial payment complete, balance pending' : 'All programme fees have been paid'}</strong></div>
                                    </div>
                                </>
                            )}
                        </div>

                        <footer className="admin-audit-foot">
                            <button type="button" onClick={() => setAuditOpen(false)}>Close audit</button>
                        </footer>
                    </section>
                </div>
            )}
        </>
    );
}
