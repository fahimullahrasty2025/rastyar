"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    Users,
    UserCheck,
    GraduationCap,
    School,
    TrendingUp,
    LayoutDashboard,
    Plus,
    Calendar,
    Search,
    Bell,
    Settings,
    ArrowUpRight,
    CreditCard,
    BookOpen,
    Activity,
    LogOut,
    User,
    QrCode
} from "lucide-react";
import Link from "next/link";
import DashboardClock from "@/components/DashboardClock";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, dir } = useLanguage();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, totalRevenue: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [errorStudents, setErrorStudents] = useState("");
    const [mounted, setMounted] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN") {
            router.push("/");
        }

        if (session) {
            fetchStudents();
            fetchStats();
            fetchRecentClasses();
        }
    }, [status, session, router]);

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

    const filteredStudents = students.filter((s: any) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.fatherName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/admin/students");
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            } else {
                setErrorStudents(t.dashboards.error_loading_students);
            }
        } catch (err) {
            setErrorStudents(t.dashboards.something_went_wrong);
        } finally {
            setLoadingStudents(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Failed to fetch stats");
        }
    };

    const fetchRecentClasses = async () => {
        try {
            const res = await fetch("/api/admin/classes");
            if (res.ok) {
                const data = await res.json();
                setClasses(data.slice(0, 4));
            }
        } catch (err) {
            console.error("Failed to fetch classes");
        } finally {
            setLoadingClasses(false);
        }
    };

    if (!mounted || status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-background transition-colors duration-500">
                <div className="relative h-20 w-20">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
                    <div className="absolute inset-4 animate-pulse rounded-full bg-primary shadow-[0_0_20px_rgba(6,182,212,0.4)]"></div>
                </div>
            </div>
        );
    }

    if (!session) return null;

    const statsDisplay = [
        { label: t.dashboards.student_count, value: stats.students.toString(), icon: GraduationCap, color: "text-cyan-400", glow: "shadow-cyan-500/20" },
        { label: t.roles.TEACHER, value: stats.teachers.toString(), icon: UserCheck, color: "text-purple-400", glow: "shadow-purple-500/20" },
        { label: t.dashboards.classes, value: stats.classes.toString(), icon: School, color: "text-emerald-400", glow: "shadow-emerald-500/20" },
        { label: t.dashboards.received_amount, value: stats.totalRevenue.toLocaleString(), icon: TrendingUp, color: "text-pink-400", glow: "shadow-pink-500/20" },
    ];

    const quickActions = [
        { label: t.dashboards.add_student, icon: Plus, href: "/dashboard/admin/students/new", bg: "bg-cyan-500/10 hover:bg-cyan-500/20", border: "border-cyan-500/20", text: "text-cyan-400" },
        { label: t.dashboards.manage_classes, icon: BookOpen, href: "/dashboard/admin/classes", bg: "bg-purple-500/10 hover:bg-purple-500/20", border: "border-purple-500/20", text: "text-purple-400" },
        { label: t.dashboards.manage_employees, icon: Users, href: "/dashboard/admin/employees", bg: "bg-emerald-500/10 hover:bg-emerald-500/20", border: "border-emerald-500/20", text: "text-emerald-400" },
    ];

    return (
        <div className="font-sans selection:bg-cyan-500/30 overflow-x-hidden transition-colors duration-700">
            {/* Ambient Background Blobs - Different for Light/Dark */}
            <div className={`fixed -top-24 ${dir === 'rtl' ? '-right-24' : '-left-24'} h-96 w-96 rounded-full bg-cyan-400/20 dark:bg-cyan-600/10 blur-[120px] animate-pulse`}></div>
            <div className={`fixed top-1/2 ${dir === 'rtl' ? '-left-24' : '-right-24'} h-[500px] w-[500px] rounded-full bg-purple-400/10 dark:bg-purple-600/5 blur-[150px] animate-pulse delay-700`}></div>
            <div className="fixed -bottom-24 left-1/2 h-80 w-80 rounded-full bg-emerald-400/10 dark:bg-emerald-600/5 blur-[100px] animate-pulse delay-1000"></div>

            {/* Content is now inside the layout's main */}
            <div className="p-4 md:p-8 relative z-10">
                {/* Clock Section */}
                <div className="mb-6 flex justify-end">
                    <DashboardClock />
                </div>

                {/* Top Glass Nav */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1 text-start">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-500">{t.dashboards.school_overview}</h2>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                            {t.dashboards.admin}
                            <span className="text-cyan-500 animate-pulse">.</span>
                        </h1>
                    </div>

                    <div className={`flex items-center gap-4 bg-card/60 backdrop-blur-xl border border-border p-2 rounded-2xl shadow-sm ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                            <Search size={20} className="text-primary dark:text-slate-400" />
                        </div>
                        <div className={`hidden sm:block ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            <p className="text-xs font-bold text-slate-500">{t.welcome}</p>
                            <p className="text-sm font-black text-foreground">{(session.user as any).name}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl border-2 border-border p-0.5 bg-card overflow-hidden group cursor-pointer hover:border-primary transition-all">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.email}`} alt="pfp" className="h-full w-full rounded-lg object-cover group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </header>

                {/* Main Grid View */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">

                    {/* Welcome Card (Large) */}
                    <div className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/40 p-10 border border-border shadow-xl dark:shadow-2xl group transition-all text-start">
                        <div className={`absolute top-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} p-8 opacity-5 dark:opacity-10 group-hover:rotate-12 group-hover:scale-125 transition-transform duration-700 text-primary dark:text-white`}>
                            <Activity size={180} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/30 text-xs font-bold text-primary dark:text-primary">
                                <Activity size={12} className="animate-spin-slow" />
                                {t.dashboards.system_online}
                            </div>
                            <h3 className="text-4xl font-black text-foreground leading-tight">
                                {t.dashboards.transform_flow}
                            </h3>
                            <div className="flex gap-4 pt-4">
                                <button className="px-6 py-3 bg-cyan-600 dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-lg hover:bg-cyan-500 dark:hover:bg-cyan-400 transition-all transform hover:-translate-y-1 active:scale-95 text-sm md:text-base">
                                    {t.dashboards.generate_report}
                                </button>
                                <button className="px-6 py-3 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-black rounded-2xl backdrop-blur-md border border-slate-300 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-all text-sm md:text-base">
                                    {t.dashboards.settings}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Widget */}
                    <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                        {statsDisplay.map((stat, i) => (
                            <div key={i} className="group p-6 rounded-[2rem] bg-card/60 backdrop-blur-xl border border-border hover:bg-card hover:border-primary transition-all hover:-translate-y-1 relative overflow-hidden shadow-sm dark:shadow-none transition-colors duration-500 text-start">
                                <div className={`absolute ${dir === 'rtl' ? '-left-4' : '-right-4'} -bottom-4 h-24 w-24 rounded-full ${stat.color} opacity-5 blur-2xl group-hover:opacity-10 transition-all`}></div>
                                <stat.icon className={`${stat.color} mb-3`} size={28} />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                                    <h4 className="text-2xl font-black text-foreground flex items-center gap-2">
                                        {stat.value}
                                        <ArrowUpRight size={16} className={`text-emerald-500 opacity-0 group-hover:opacity-100 ${dir === 'rtl' ? 'translate-x-[10px]' : 'translate-x-[-10px]'} group-hover:translate-x-0 transition-all`} />
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Action Cards */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-black text-foreground px-2 flex items-center justify-between">
                            {t.dashboards.quick_actions}
                            <span className="h-1 w-12 bg-primary/50 rounded-full"></span>
                        </h4>
                        <div className="space-y-4">
                            <div className="p-1 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-purple-500/20">
                                <div className="p-6 rounded-[calc(1.5rem-2px)] bg-card border border-border space-y-4 shadow-sm text-start">
                                    <p className="text-sm font-bold text-slate-500">{t.dashboards.quick_actions_desc}</p>
                                    <div className="flex flex-col gap-2">
                                        {quickActions.map((action, i) => (
                                            <Link key={i} href={action.href} className={`flex items-center justify-between p-4 rounded-2xl border ${action.border} ${action.bg} transition-all hover:scale-[1.02] active:scale-95 group`}>
                                                <div className="flex items-center gap-3">
                                                    <action.icon className={action.text} size={20} />
                                                    <span className={`text-sm font-black ${action.text}`}>{action.label}</span>
                                                </div>
                                                <ArrowUpRight size={18} className={`${action.text} opacity-30 group-hover:opacity-100 transition-opacity`} />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* AFN Status Widget */}
                            <div className="p-8 rounded-[2.5rem] bg-card dark:bg-gradient-to-br dark:from-slate-900 dark:via-black dark:to-slate-900 border border-border relative overflow-hidden flex flex-col items-center text-center shadow-lg dark:shadow-none transition-colors">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
                                <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-4 border border-primary/10 text-primary">
                                    <TrendingUp size={32} />
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">{t.dashboards.financial_info}</p>
                                <h5 className="text-4xl font-black text-foreground">{stats.totalRevenue.toLocaleString()}</h5>
                                <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{t.dashboards.currency}</p>
                                <div className="mt-6 w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-border">
                                    <div className="h-full w-[70%] bg-gradient-to-r from-primary to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                                </div>
                                <p className="mt-3 text-[10px] font-bold text-slate-400">70% of Monthly Target Collected</p>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: Active Classes & Student List */}
                    <div className="xl:col-span-2 space-y-8">

                        {/* Students List Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-lg font-black text-foreground">{t.dashboards.students_list || "Registered Students"}</h4>
                                <button className="text-xs font-black text-primary hover:text-foreground transition-colors flex items-center gap-1">
                                    <Users size={14} />
                                    {t.dashboards.view_all}
                                </button>
                            </div>

                            {/* Modern Search Bar - RTL Aware */}
                            <div className="relative group px-2">
                                <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-6' : 'left-6'} flex items-center pointer-events-none`}>
                                    <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors duration-300" />
                                </div>
                                <input
                                    id="student-search"
                                    ref={searchInputRef}
                                    type="text"
                                    dir={dir}
                                    placeholder={t.dashboards.search_placeholder}
                                    className={`w-full bg-card/40 backdrop-blur-xl border border-border rounded-2xl py-3.5 ${dir === 'rtl' ? 'pr-12' : 'pl-12'} pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-lg group-hover:bg-card/60`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'left-6' : 'right-6'} flex items-center`}>
                                    <div className="px-2 py-0.5 rounded-md bg-slate-500/10 text-[10px] font-black text-slate-400">
                                        {dir === 'rtl' ? 'K + CTRL' : 'CTRL + K'}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className={`w-full ${dir === 'rtl' ? 'text-right' : 'text-left'} border-collapse`}>
                                        <thead>
                                            <tr className="bg-slate-500/5 border-b border-border">
                                                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.student_registration.student_id}</th>
                                                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.student_registration.name_dr}</th>
                                                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.student_registration.father_name_dr}</th>
                                                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.dashboards.classes}</th>
                                                <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>ACTION</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {loadingStudents ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic font-bold">
                                                        {t.dashboards.loading_students}
                                                    </td>
                                                </tr>
                                            ) : errorStudents ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-red-500 italic font-bold">
                                                        {errorStudents}
                                                    </td>
                                                </tr>
                                            ) : filteredStudents.length > 0 ? filteredStudents.slice(0, 5).map((student: any) => (
                                                <tr key={student.id} className="group hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/admin/students/${student.id}`)}>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-border rounded-lg text-xs font-black text-slate-600 dark:text-slate-400">
                                                            {student.studentId}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform overflow-hidden shadow-sm">
                                                                {student.image ? (
                                                                    <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <User size={18} className="text-primary" />
                                                                )}
                                                            </div>
                                                            <p className="text-sm font-black text-foreground">{student.name}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-slate-500">{student.fatherName || "---"}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-bold text-slate-500">{student.currentClass?.name || t.dashboards.inactive}</p>
                                                    </td>
                                                    <td className={`px-6 py-4 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                                                        <Link href={`/dashboard/admin/students/${student.id}`} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-primary hover:text-white transition-all inline-block">
                                                            <ArrowUpRight size={16} className={dir === 'rtl' ? 'rotate-[270deg]' : ''} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic font-bold">
                                                        {t.dashboards.no_results}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-lg font-black text-foreground">{t.dashboards.classes || "Active Classes"}</h4>
                            <button className="text-xs font-black text-primary hover:text-foreground transition-colors">{t.dashboards.view_all}</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loadingClasses ? (
                                <div className="col-span-2 text-center py-8 text-slate-500">{t.dashboards.loading_students}</div>
                            ) : classes.length > 0 ? classes.map((classItem) => (
                                <Link key={classItem.id} href={`/dashboard/admin/classes/${classItem.id}`} className="group p-5 rounded-3xl bg-card/60 backdrop-blur-md border border-border hover:border-primary transition-all cursor-pointer relative overflow-hidden shadow-sm dark:shadow-none text-start">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-gradient-to-tr dark:from-slate-800 dark:to-slate-900 border border-border flex items-center justify-center text-primary">
                                            <School size={24} />
                                        </div>
                                        <div className="flex -space-x-2">
                                            {classItem.students?.slice(0, 3).map((student: any, i: number) => (
                                                <div key={i} className="h-7 w-7 rounded-full border-2 border-white dark:border-[#07070a] bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black overflow-hidden select-none">
                                                    {student.image ? (
                                                        <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-[8px]">{student.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                            ))}
                                            {(classItem._count?.students || 0) > 3 && (
                                                <div className="h-7 w-7 rounded-full border-2 border-white dark:border-[#07070a] bg-cyan-500 flex items-center justify-center text-[8px] font-black text-white">
                                                    +{(classItem._count?.students || 0) - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h5 className="font-black text-foreground text-lg">{classItem.level} - {classItem.section}</h5>
                                    <p className="text-xs font-bold text-slate-500 mb-4">{classItem.gender === 'BOYS' ? t.dashboards.gender_boys : classItem.gender === 'GIRLS' ? t.dashboards.gender_girls : t.dashboards.gender_mixed}</p>
                                    <div className="flex items-center justify-between text-[10px] font-black py-2 border-t border-border">
                                        <span className="text-emerald-500">{t.dashboards.active}</span>
                                        <span className="text-slate-500 dark:text-slate-400">{classItem._count?.students || 0} {t.dashboards.student_count}</span>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-2 text-center py-8 text-slate-500">{t.dashboards.no_results}</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
