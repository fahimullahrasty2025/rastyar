"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    UserPlus,
    Users,
    Settings,
    ArrowRight,
    UserCheck,
    GraduationCap,
    Clock,
    BookOpen
} from "lucide-react";
import Link from "next/link";
import DashboardClock from "@/components/DashboardClock";

export default function TeacherDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, dir } = useLanguage();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
        } else if (session && (session.user as any).role !== "TEACHER") {
            router.push("/");
        }
    }, [status, session, router]);

    if (status === "loading") return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!session || (session.user as any).role !== "TEACHER") return null;

    const quickActions = [
        {
            title: t.student_registration.title,
            desc: "Register new students to your classes.",
            icon: GraduationCap,
            href: "/dashboard/teacher/students/new",
            color: "bg-cyan-500"
        },
        {
            title: "Register Parent",
            desc: "Add parents and link them to students.",
            icon: Users,
            href: "/dashboard/teacher/parents/new",
            color: "bg-purple-500"
        },
        {
            title: "Update Profile",
            desc: "Manage your personal and professional info.",
            icon: Settings,
            href: "/dashboard/teacher/profile",
            color: "bg-emerald-500"
        },
        {
            title: "My Classes",
            desc: "View and manage your assigned classes.",
            icon: GraduationCap,
            href: "/dashboard/teacher/classes",
            color: "bg-orange-500"
        }
    ];

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex justify-end">
                <DashboardClock />
            </div>
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-8 md:p-12 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        {t.welcome}, <span className="text-emerald-200">{(session.user as any).name}</span>!
                    </h1>
                    <p className="text-emerald-50/80 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                        Welcome to your education command center. Manage your students, communicate with parents, and track academic progress all in one place.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-sm font-bold">
                            <Clock size={16} />
                            {new Date().toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-400/20 backdrop-blur-md rounded-full border border-emerald-400/20 text-sm font-bold">
                            <UserCheck size={16} />
                            {t.roles.TEACHER}
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-12 -mb-12 h-48 w-48 bg-emerald-400/20 rounded-full blur-2xl opacity-30"></div>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase tracking-widest">{t.dashboards.quick_actions}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action, i) => (
                        <Link
                            key={i}
                            href={action.href}
                            className="group relative overflow-hidden p-6 rounded-[2rem] bg-card border border-border shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`h-14 w-14 ${action.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-inherit transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                <action.icon size={28} />
                            </div>
                            <h3 className="text-xl font-black mb-2 group-hover:text-emerald-500 transition-colors">{action.title}</h3>
                            <p className="text-slate-500 text-sm font-bold leading-relaxed">{action.desc}</p>
                            <div className="mt-6 flex items-center text-xs font-black uppercase tracking-widest text-emerald-500 items-center gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                Get Started <ArrowRight size={14} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Managed Section Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black">Upcoming Tasks</h3>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">Active Academic Year</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border">
                            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                <GraduationCap size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-black">End of Term Exams</p>
                                <p className="text-[10px] font-bold text-slate-500">Starts in 12 days</p>
                            </div>
                            <button className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-black hover:bg-slate-100 dark:hover:bg-white/10 transition-all">Prepare</button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl space-y-6">
                    <h3 className="text-xl font-black">School Policy</h3>
                    <p className="text-slate-300 text-sm font-bold leading-relaxed">
                        Ensure all student photos are updated before the ID cards generation deadline.
                    </p>
                    <div className="pt-4 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Notice</p>
                        <p className="text-xs font-bold text-slate-300">New grading rules implemented for primary levels.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
