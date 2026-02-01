"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import {
    Users,
    School,
    RefreshCw,
    BookOpen,
    CreditCard,
    Briefcase,
    UserPlus
} from "lucide-react";
import DashboardClock from "@/components/DashboardClock";

export default function SuperAdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [statsData, setStatsData] = useState<any>(null);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const res = await fetch("/api/admin/stats");
            if (res.ok) {
                const data = await res.json();
                setStatsData(data);
            }
        } catch (err) {
            console.error("Failed to fetch stats");
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "SUPERADMIN") {
            router.push("/");
        } else if (session) {
            fetchStats();
        }
    }, [status, session, router, fetchStats]);

    if (!mounted || status === "loading") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg text-primary"></div>
            </div>
        );
    }

    if (!session || (session.user as any).role !== "SUPERADMIN") return null;

    const stats = [
        { label: t.dashboards.total_students, value: statsData?.students || "0", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: t.dashboards.total_classes, value: statsData?.classes || "0", icon: School, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: t.dashboards.total_subjects, value: statsData?.subjects || "0", icon: BookOpen, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: t.dashboards.money_received, value: `${statsData?.totalAmount || 0} ${t.dashboards.currency}`, icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ];

    return (
        <div className="p-3 md:p-6 transition-colors duration-300 font-sans max-w-6xl mx-auto">
            {/* Clock Section (Floating Modern) */}
            <div className="mb-8 flex justify-end">
                <DashboardClock />
            </div>

            {/* Header Section */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-start">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-1">{t.dashboards.control_center}</h2>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        {t.dashboards.superadmin}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchStats}
                        className="p-3 rounded-2xl border border-border bg-card shadow-sm hover:bg-muted transition-all"
                    >
                        <RefreshCw size={20} className={loadingStats ? "animate-spin" : ""} />
                    </button>
                    <Link href="/dashboard/superadmin/users/new" className="flex items-center gap-3 rounded-[1.25rem] bg-primary px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-primary/20 transition hover:bg-primary/90 active:scale-95">
                        <UserPlus size={20} />
                        <span>{t.dashboards.add_admin}</span>
                    </Link>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="flex items-center justify-between text-start">
                            <div className="text-start">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
                            </div>
                            <div className={`rounded-2xl ${stat.bg} p-4 ${stat.color} group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                                <stat.icon size={28} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {/* Manage Subjects Card */}
                <div className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex flex-col text-start items-start">
                        <div className={`w-14 h-14 rounded-2xl bg-orange-500/10 p-4 text-orange-500 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all flex items-center justify-center`}>
                            <BookOpen size={24} />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t.dashboards.subjects}</p>
                        <h3 className="text-xl font-black text-foreground mb-4">{t.dashboards.manage_subjects}</h3>
                        <Link href="/dashboard/superadmin/subjects" className="inline-flex items-center gap-2 text-xs font-black text-orange-500 hover:gap-4 transition-all uppercase">
                            {t.dashboards.open_console} →
                        </Link>
                    </div>
                </div>

                {/* Manage Classes Card */}
                <div className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex flex-col text-start items-start">
                        <div className={`w-14 h-14 rounded-2xl bg-purple-500/10 p-4 text-purple-500 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all flex items-center justify-center`}>
                            <School size={24} />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t.dashboards.classes}</p>
                        <h3 className="text-xl font-black text-foreground mb-4">{t.dashboards.manage_classes}</h3>
                        <Link href="/dashboard/superadmin/classes" className="inline-flex items-center gap-2 text-xs font-black text-purple-500 hover:gap-4 transition-all uppercase">
                            {t.dashboards.open_console} →
                        </Link>
                    </div>
                </div>

                {/* Manage Employees Card */}
                <div className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex flex-col text-start items-start">
                        <div className={`w-14 h-14 rounded-2xl bg-blue-500/10 p-4 text-blue-500 mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all flex items-center justify-center`}>
                            <Briefcase size={24} />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t.dashboards.human_resources}</p>
                        <h3 className="text-xl font-black text-foreground mb-4">{t.dashboards.manage_employees}</h3>
                        <Link href="/dashboard/superadmin/employees" className="inline-flex items-center gap-2 text-xs font-black text-blue-500 hover:gap-4 transition-all uppercase">
                            {t.dashboards.open_directory} →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
