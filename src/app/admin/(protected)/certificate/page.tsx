"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type ThemeKey = "admin" | "user";

const THEMES = [
  { key: "admin" as ThemeKey, label: "Admin theme" },
  { key: "user" as ThemeKey, label: "User theme" },
];

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
};

export default function CertificatesPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState<FoundUser | null>(null);
  const [course, setCourse] = useState("");
  const [months, setMonths] = useState("");
  const [theme, setTheme] = useState<ThemeKey>("user");
  const [logoUrl, setLogoUrl] = useState("/logo.png");

  const [issued, setIssued] = useState<IssuedCert[]>([]);
  const [q, setQ] = useState("");
  const [listLoading, setListLoading] = useState(false);

  const issuedOn = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

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
        return;
      }
      const u: FoundUser = data.user;
      setFound(u);
      setCourse(u.course || "");
      setMonths(u.months || "");
      toast.success("User found");
    } catch {
      toast.error("Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!found) return;
    setLoading(true);
    try {
      await axios.post("/api/admin/certificate/send", {
        recipientName: found.fullName,
        email: found.email,
        phone: found.phone,
        course,
        months,
        theme,
        logoUrl,
      });
      toast.success("Certificate sent");
      await loadIssued(q);
    } catch {
      toast.error("Failed to send");
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = useMemo(() => {
    const search = new URLSearchParams({
      theme,
      logoUrl,
      recipientName: found?.fullName || "Recipient Name",
      email: found?.email || email || "user@example.com",
      phone: found?.phone || "",
      course: course || "Course Title",
      months: months || "3 months",
      issuedOn,
    });
    return `/api/certificate/preview?${search.toString()}`;
  }, [found, email, course, months, theme, logoUrl, issuedOn]);

  const filteredIssued = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return issued;
    return issued.filter(
      (c) =>
        c.fullName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [issued, q]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="bg-gradient-to-r from-green-800 to-green-500 text-white rounded-md p-6 mb-8">
        <h1 className="text-3xl font-bold">Certificates</h1>
        <p className="text-lg mt-1">Send, and review issued certificates</p>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Send Certificate</h2>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by user email"
            className="input-field bg-white"
          />
          <button
            onClick={lookup}
            className="rounded-md bg-[var(--primary)] text-white px-4 py-2 font-semibold"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeKey)}
            className="input-field bg-white"
          >
            {THEMES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {found && (
          <div className="mb-2 rounded-lg border p-4 bg-white">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="font-semibold">{found.fullName}</div>
                <div className="text-sm opacity-80">{found.email}</div>
                <div className="text-sm opacity-80">{found.phone}</div>
              </div>
              <div className="grid gap-2">
                <input
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Course title"
                  className="input-field bg-white"
                />
                <input
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  placeholder="Duration (e.g., 8 months)"
                  className="input-field bg-white"
                />
                <input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Logo URL (/logo.png or https://...)"
                  className="input-field bg-white"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={send}
                className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-semibold"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Certificate"}
              </button>
              <a
                href={previewUrl}
                target="_blank"
                className="rounded-md bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 font-semibold"
              >
                Preview
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Issued Certificates</h3>
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
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
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {listLoading && filteredIssued.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!listLoading &&
                filteredIssued.map((c) => (
                  <tr key={c._id} className="border-t hover:bg-gray-50/50">
                    <td className="px-4 py-2">{c.fullName}</td>
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2">{c.course}</td>
                    <td className="px-4 py-2">{c.months}</td>
                    <td className="px-4 py-2">{new Date(c.issuedOn || c.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <a
                        href={`/api/admin/certificate/preview?recipientName=${encodeURIComponent(
                          c.fullName
                        )}&email=${encodeURIComponent(c.email)}&course=${encodeURIComponent(
                          c.course
                        )}&months=${encodeURIComponent(c.months)}&issuedOn=${encodeURIComponent(
                          c.issuedOn
                        )}`}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
