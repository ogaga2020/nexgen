"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type FoundUser = {
  fullName: string;
  email: string;
  phone: string;
  course: string;
  months: string;
};

type IssuedCert = {
  _id: string;
  fullName: string;
  email: string;
  course: string;
  months: string;
  issuedOn: string;
  createdAt: string;
  issuedAt?: string;
};

export default function CertificatesPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState<FoundUser | null>(null);
  const [course, setCourse] = useState("");
  const [months, setMonths] = useState("");
  const [confirmOk, setConfirmOk] = useState(false);

  const [issued, setIssued] = useState<IssuedCert[]>([]);
  const [q, setQ] = useState("");
  const [listLoading, setListLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");

  const loadIssued = async (search?: string) => {
    setListLoading(true);
    try {
      const { data } = await axios.get<IssuedCert[]>("/api/admin/certificate/issued", {
        params: { q: search || "", t: Date.now() },
        headers: { "cache-control": "no-cache" },
      });
      setIssued(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to load issued certificates");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadIssued();
  }, []);

  const alreadyCertified = useMemo(() => {
    if (!found) return false;
    return issued.some(
      (c) =>
        c.email.toLowerCase() === found.email.toLowerCase() &&
        c.course.toLowerCase() === (course || "").toLowerCase()
    );
  }, [issued, found, course]);

  const lookup = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/certificate/lookup?email=${encodeURIComponent(email)}`, {
        headers: { "cache-control": "no-cache" },
      });
      if (!data?.found) {
        toast.error("No user found for that email");
        setFound(null);
        setConfirmOk(false);
        return;
      }
      const u: FoundUser = data.user;
      setFound(u);
      setCourse(u.course || "");
      setMonths(u.months || "");
      setConfirmOk(false);
      toast.success("User found");
    } catch {
      toast.error("Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setFound(null);
    setCourse("");
    setMonths("");
    setConfirmOk(false);
  };

  const send = async () => {
    if (!found) return;
    if (!confirmOk) {
      toast.error("Confirm the user's name and email before sending");
      return;
    }
    if (alreadyCertified) {
      toast.error("This user has already been certified for this course");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/admin/certificate/send", {
        recipientName: found.fullName,
        email: found.email,
        phone: found.phone,
        course,
        months,
      });
      toast.success("Certificate sent");
      await loadIssued(q);
      resetForm();
    } catch {
      toast.error("Failed to send");
    } finally {
      setLoading(false);
    }
  };

  const buildPreviewUrl = (p: {
    fullName: string;
    email: string;
    phone?: string;
    course: string;
    months: string;
    issuedOn?: string;
  }) => {
    const search = new URLSearchParams({
      recipientName: p.fullName,
      email: p.email,
      phone: p.phone || "",
      course: p.course,
      months: p.months,
      issuedOn: p.issuedOn || "",
    });
    return `/api/admin/certificate/preview?${search.toString()}`;
  };

  const openView = (title: string, src: string) => {
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      window.open(src, "_blank", "noopener,noreferrer");
      return;
    }
    setModalTitle(title);
    setModalSrc(src);
    setModalOpen(true);
  };

  const filteredIssued = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return issued;
    return issued.filter(
      (c) =>
        c.fullName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [issued, q]);

  const formatIssued = (c: IssuedCert) =>
    new Date(c.issuedAt || c.issuedOn || c.createdAt).toLocaleString(
      undefined,
      { dateStyle: "long", timeStyle: "short" }
    );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="bg-gradient-to-r from-green-800 to-green-500 text-white rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-lg mt-1">Issue and review certificates</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Issuing Certificate</h2>

        <div className="grid md:grid-cols-[1fr_auto] gap-3 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email"
            className="input-field bg-white"
          />
          <button
            onClick={lookup}
            className="rounded-md bg-[var(--primary)] text-white px-4 py-2 font-semibold"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {found && (
          <div className="rounded-lg border p-4 bg-white">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="font-semibold text-lg">{found.fullName}</div>
                <div className="text-sm opacity-80">{found.email}</div>
                <div className="text-sm opacity-80">{found.phone}</div>
                {alreadyCertified && (
                  <div className="inline-flex items-center gap-2 mt-2 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                    Already certified for this course
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="input-field bg-white"
                >
                  <option value="" disabled>
                    Select course
                  </option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Solar">Solar</option>
                </select>

                <select
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  className="input-field bg-white"
                >
                  <option value="" disabled>
                    Select duration
                  </option>
                  <option value="4 months">4 months</option>
                  <option value="8 months">8 months</option>
                  <option value="12 months">12 months</option>
                </select>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={confirmOk}
                    onChange={(e) => setConfirmOk(e.target.checked)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                  Confirm the name and email are correct
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={send}
                className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-semibold disabled:opacity-60"
                disabled={!confirmOk || loading || alreadyCertified}
              >
                {loading ? "Sending..." : "Send Certificate"}
              </button>

              <button
                onClick={resetForm}
                className="rounded-md border px-4 py-2 font-semibold hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Issued Certificates</h3>
            <div className="hidden md:flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadIssued(q)}
                placeholder="Search by name or email"
                className="input-field bg-white w-64"
              />
              <button
                onClick={() => loadIssued(q)}
                className="rounded-md border px-3 py-2 hover:bg-gray-50"
                disabled={listLoading}
              >
                {listLoading ? "Filtering…" : "Search"}
              </button>
              <button
                onClick={() => loadIssued(q)}
                className="rounded-md border px-3 py-2 hover:bg-gray-50"
                disabled={listLoading}
              >
                {listLoading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 md:hidden">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadIssued(q)}
              placeholder="Search by name or email"
              className="input-field bg-white w-full"
            />
            <div className="flex gap-2">
              <button
                onClick={() => loadIssued(q)}
                className="rounded-md border px-3 py-2 hover:bg-gray-50 w-full"
                disabled={listLoading}
              >
                {listLoading ? "Filtering…" : "Search"}
              </button>
              <button
                onClick={() => loadIssued(q)}
                className="rounded-md border px-3 py-2 hover:bg-gray-50 w-full"
                disabled={listLoading}
              >
                {listLoading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        <div className="md:hidden space-y-4">
          {filteredIssued.map((c) => {
            const issuedDisplay = formatIssued(c);
            return (
              <div key={c._id} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-base truncate">{c.fullName}</div>
                    <div className="text-sm text-gray-600 break-words">{c.email}</div>
                  </div>
                  <button
                    onClick={() =>
                      openView(
                        c.fullName,
                        buildPreviewUrl({
                          fullName: c.fullName,
                          email: c.email,
                          course: c.course,
                          months: c.months,
                          issuedOn: issuedDisplay,
                        })
                      )
                    }
                    className="shrink-0 rounded-md bg-[var(--primary)] text-white px-3 py-1.5 text-sm"
                  >
                    View
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full bg-gray-100 border text-gray-800 text-xs">
                    {c.course}
                  </span>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full bg-gray-100 border text-gray-800 text-xs">
                    {c.months}
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-500">Issued • {issuedDisplay}</div>
              </div>
            );
          })}

          {!listLoading && filteredIssued.length === 0 && (
            <div className="text-center text-gray-500 py-8">No certificates found.</div>
          )}
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Course</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Issued On</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {!listLoading &&
                filteredIssued.map((c) => {
                  const issuedDisplay = formatIssued(c);
                  return (
                    <tr key={c._id} className="border-t hover:bg-gray-50/50">
                      <td className="px-4 py-2">{c.fullName}</td>
                      <td className="px-4 py-2">{c.email}</td>
                      <td className="px-4 py-2">{c.course}</td>
                      <td className="px-4 py-2">{c.months}</td>
                      <td className="px-4 py-2">{issuedDisplay}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() =>
                            openView(
                              c.fullName,
                              buildPreviewUrl({
                                fullName: c.fullName,
                                email: c.email,
                                course: c.course,
                                months: c.months,
                                issuedOn: issuedDisplay,
                              })
                            )
                          }
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              {listLoading && filteredIssued.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!listLoading && filteredIssued.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No certificates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-0"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative bg-white w-[96vw] h-[96vh] md:w-[90vw] md:h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-semibold truncate pr-4">{modalTitle}</div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md border px-3 py-1.5 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <div className="w-full h-full">
              {modalSrc ? (
                <iframe
                  src={modalSrc}
                  className="w-full h-[calc(100%-49px)]"
                  title="Certificate"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
