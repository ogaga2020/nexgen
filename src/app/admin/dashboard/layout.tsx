import AdminNavbar from "@/components/AdminNavbar";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const token = cookieStore.get("adminToken")?.value;

    let isAuthenticated = false;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET!);
            isAuthenticated = true;
        } catch {
            isAuthenticated = false;
        }
    }

    return (
        <>
            {isAuthenticated && <AdminNavbar />}
            <main className="p-4">{children}</main>
        </>
    );
}
