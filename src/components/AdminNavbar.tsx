'use client';

import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminNavbar() {
    const router = useRouter();

    const handleLogout = async () => {
        await axios.post("/api/admin/logout");
        router.push("/admin");
    };

    return (
        <nav className="bg-primary text-white px-6 py-3 flex justify-between items-center">
            <h1 className="font-bold text-lg">NexGen Admin</h1>
            <div className="space-x-4">
                <button onClick={() => router.push("/admin/dashboard")}>Dashboard</button>
                <button onClick={() => router.push("/admin/create")}>Create Admin</button>
                <button onClick={handleLogout} className="bg-white text-primary px-3 py-1 rounded">
                    Logout
                </button>
            </div>
        </nav>
    );
}
