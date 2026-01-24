"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import {
    Users,
    School,
    ShieldCheck,
    TrendingUp,
    Bell,
    Settings,
    Activity,
    UserPlus,
    LayoutDashboard,
    Trash2,
    RefreshCw,
    UserCog,
    BookOpen,
    Search
} from "lucide-react";

type User = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    image: string | null;
    phone: string | null;
    receivedAmount: number;
};

export default function SuperAdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Failed to fetch users");
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        setMounted(true);
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "SUPERADMIN") {
            router.push("/");
        } else if (session) {
            fetchUsers();
        }
    }, [status, session, router, fetchUsers]);

    const updateRole = async (userId: string, newRole: string) => {
        try {
            const res = await fetch("/api/users", {
                method: "PUT",
                body: JSON.stringify({ userId, role: newRole }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) fetchUsers();
        } catch (err) {
            console.error("Update role failed");
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch("/api/users", {
                method: "DELETE",
                body: JSON.stringify({ userId }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) fetchUsers();
        } catch (err) {
            console.error("Delete user failed");
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (!mounted || status === "loading") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg"></div>
            </div>
        );
    }

    if (!session || (session.user as any).role !== "SUPERADMIN") return null;

    const stats = [
        { label: "Total Schools", value: "24", icon: School, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Total Users", value: users.length.toString(), icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        { label: "Pending Requests", value: users.filter(u => u.role === "TEACHER").length.toString(), icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Active Admins", value: users.filter(u => u.role === "ADMIN").length.toString(), icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];

    return (
        <div className="p-3 md:p-6 transition-colors duration-300 font-sans">
            {/* Header Section */}
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black tracking-tight md:text-2xl text-foreground">
                        {t.dashboards.superadmin}
                    </h1>
                    <p className="mt-1 text-muted-foreground text-sm">
                        {t.welcome}, <span className="font-semibold text-primary">{(session.user as any).name}</span>. 👋
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchUsers}
                        className="p-2 rounded-full border border-border bg-card shadow-sm hover:bg-muted transition-all"
                    >
                        <RefreshCw size={16} className={loadingUsers ? "animate-spin" : ""} />
                    </button>
                    <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-primary/90 active:scale-95">
                        <UserPlus size={16} />
                        <span>New Admin</span>
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                <h3 className="mt-0.5 text-xl font-black text-foreground">{stat.value}</h3>
                            </div>
                            <div className={`rounded-lg ${stat.bg} p-2 ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-[10px] font-bold text-emerald-500">
                            <TrendingUp size={12} className="mr-1" />
                            <span>+12% tracking</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
                {/* Manage Subjects Card */}
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.dashboards.subjects}</p>
                            <h3 className="mt-1 text-lg font-black text-foreground">{t.dashboards.manage_subjects}</h3>
                        </div>
                        <div className={`rounded-xl bg-orange-500/10 p-3 text-orange-500 group-hover:scale-110 transition-transform`}>
                            <BookOpen size={24} />
                        </div>
                    </div>
                    <Link href="/dashboard/superadmin/subjects" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-500/20 transition-all">
                        {t.dashboards.manage_subjects} →
                    </Link>
                </div>

                {/* Manage Classes Card */}
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.dashboards.classes}</p>
                            <h3 className="mt-1 text-lg font-black text-foreground">{t.dashboards.manage_classes}</h3>
                        </div>
                        <div className={`rounded-xl bg-purple-500/10 p-3 text-purple-500 group-hover:scale-110 transition-transform`}>
                            <School size={24} />
                        </div>
                    </div>
                    <Link href="/dashboard/superadmin/classes" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-500/20 transition-all">
                        {t.dashboards.manage_classes} →
                    </Link>
                </div>

                {/* System Status Card */}
                <div className="rounded-2xl border border-border bg-gradient-to-br from-indigo-600 to-blue-700 p-5 shadow-lg text-white">
                    <Activity className="mb-2 text-white/50" size={24} />
                    <h4 className="text-base font-bold">System Status</h4>
                    <p className="mt-1 text-[11px] text-blue-100 opacity-80 leading-tight">All modules are running smoothly. Database sync active.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* User Management Section */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <UserCog className="text-primary" size={20} />
                            <h2 className="text-xl font-black text-foreground">{t.dashboards.user_management}</h2>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <div className="relative group w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={t.dashboards.search_placeholder || "Search users..."}
                                    className="w-full bg-muted/20 border border-border rounded-lg pl-9 pr-12 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-muted text-[8px] font-black text-muted-foreground">
                                    CTRL+K
                                </div>
                            </div>

                            <select
                                className="w-full md:w-auto bg-muted/20 border border-border rounded-lg px-3 py-2 text-xs font-black outline-none focus:ring-1 focus:ring-primary"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="ALL">All Roles</option>
                                {Object.keys(t.roles).map(role => (
                                    <option key={role} value={role}>{t.roles[role as keyof typeof t.roles]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                                    <th className="pb-3 pl-2 font-bold w-12 text-center">#</th>
                                    <th className="pb-3 font-bold">{t.register_page.name}</th>
                                    <th className="pb-3 font-bold">{t.dashboards.phone}</th>
                                    <th className="pb-3 font-bold">{t.role}</th>
                                    <th className="pb-3 font-bold">{t.dashboards.received_amount}</th>
                                    <th className="pb-3 font-bold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="group hover:bg-muted/30 transition-colors">
                                        <td className="py-2.5 pl-2 text-center">
                                            <div className="h-8 w-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center mx-auto">
                                                {u.image ? (
                                                    <img src={u.image} alt={u.name || "User"} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-[10px] font-bold text-muted-foreground">
                                                        {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-2.5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground leading-tight">{u.name || "---"}</span>
                                                <span className="text-[10px] text-muted-foreground leading-none" dir="ltr">{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 text-xs text-muted-foreground font-medium" dir="ltr">
                                            {u.phone || "---"}
                                        </td>
                                        <td className="py-2.5">
                                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${u.role === 'SUPERADMIN' ? 'bg-red-500/10 text-red-500' :
                                                u.role === 'ADMIN' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {t.roles[u.role as keyof typeof t.roles] || u.role}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-xs font-black text-foreground">
                                            <span className="text-primary">{u.receivedAmount || 0}</span>
                                            <span className="ml-1 text-[9px] text-muted-foreground">{t.dashboards.currency}</span>
                                        </td>
                                        <td className="py-2.5">
                                            <div className="flex items-center justify-center">
                                                <Link
                                                    href={u.role === 'STUDENT' ? `/dashboard/admin/students/${u.id}` : `/dashboard/superadmin/users/${u.id}`}
                                                    className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary hover:bg-primary/20 transition-all uppercase"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && !loadingUsers && (
                            <div className="py-12 text-center">
                                <Users className="mx-auto text-muted-foreground/30 mb-2" size={48} />
                                <p className="text-sm font-bold text-muted-foreground">No users found matching your criteria.</p>
                                <button onClick={() => { setSearchTerm(""); setRoleFilter("ALL") }} className="mt-2 text-xs font-black text-primary hover:underline">Clear all filters</button>
                            </div>
                        )}
                        {loadingUsers && (
                            <div className="py-6 text-center text-xs text-muted-foreground">Loading users...</div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
