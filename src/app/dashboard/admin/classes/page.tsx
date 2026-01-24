"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    Plus,
    School,
    Users,
    Search,
    ArrowUpRight,
    Loader2,
    Calendar,
    Filter,
    BookOpen,
    LayoutGrid,
    List
} from "lucide-react";
import Link from "next/link";

export default function AdminClassesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, dir } = useLanguage();

    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const searchInputRef = useRef<HTMLInputElement>(null);

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
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN") {
            router.push("/");
        }

        if (session) {
            fetchClasses();
        }
    }, [status, session, router]);

    const fetchClasses = async () => {
        try {
            const res = await fetch("/api/admin/classes");
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
            }
        } catch (err) {
            console.error("Failed to fetch classes");
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes.filter((c: any) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.section.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (status === "loading" || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="font-sans pb-12">
            {/* Ambient Blobs */}
            <div className={`fixed -top-24 ${dir === 'rtl' ? '-right-24' : '-left-24'} h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-pulse pointer-events-none`}></div>
            <div className={`fixed bottom-0 ${dir === 'rtl' ? '-left-24' : '-right-24'} h-96 w-96 rounded-full bg-purple-600/5 blur-[120px] animate-pulse pointer-events-none`}></div>

            <div className="container mx-auto px-4 md:px-8 py-8 relative z-10">

                {/* Header */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1 text-start">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-primary">{t.dashboards.admin}</h2>
                        <h1 className="text-4xl font-black tracking-tight">{t.dashboards.manage_classes || "Class Management"}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/admin/classes/new"
                            className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <Plus size={20} />
                            {t.dashboards.add_class}
                        </Link>
                    </div>
                </header>

                {/* Toolbar */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md group">
                        <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors`}>
                            <Search size={18} />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={t.dashboards.search_placeholder}
                            className={`w-full bg-card/60 backdrop-blur-xl border border-border rounded-2xl py-3.5 ${dir === 'rtl' ? 'pr-12' : 'pl-12'} pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'left-4' : 'right-4'} flex items-center pointer-events-none`}>
                            <div className="px-2 py-0.5 rounded-md bg-slate-500/10 text-[10px] font-black text-slate-400">
                                {dir === 'rtl' ? 'K + CTRL' : 'CTRL + K'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">{t.dashboards.results}</p>
                            <p className="text-sm font-black text-foreground leading-none">{filteredClasses.length} {t.dashboards.classes}</p>
                        </div>

                        <div className="flex items-center gap-2 p-1.5 bg-card/60 backdrop-blur-xl border border-border rounded-2xl shadow-sm">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-500/10'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-500/10'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {classes.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center bg-card/40 backdrop-blur-xl rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10 text-center space-y-4">
                        <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
                            <School size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">No Classes Found</h3>
                            <p className="text-sm font-bold text-slate-500 mt-1 max-w-xs mx-auto">Start by registering your first class and assigning students.</p>
                        </div>
                        <Link
                            href="/dashboard/admin/classes/new"
                            className="px-8 py-3.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Register First Class
                        </Link>
                    </div>
                ) : filteredClasses.length > 0 ? (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClasses.map((item: any) => (
                                <div key={item.id} className="group p-6 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border hover:border-primary transition-all relative overflow-hidden shadow-xl text-start">
                                    <div className={`absolute ${dir === 'rtl' ? '-left-8' : '-right-8'} -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all`}></div>

                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <School size={28} />
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${item.gender === 'BOYS' ? 'bg-blue-500/10 text-blue-500' : item.gender === 'GIRLS' ? 'bg-pink-500/10 text-pink-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {item.gender === 'BOYS' ? t.dashboards.gender_boys : item.gender === 'GIRLS' ? t.dashboards.gender_girls : t.dashboards.gender_mixed}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-6 relative z-10">
                                        <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                                        <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                            <Calendar size={14} />
                                            {t.dashboards.academic_year || "Active Academic Year"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                                        <div className="p-4 rounded-2xl bg-slate-500/5 border border-border/50">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.dashboards.homeroom_teacher}</p>
                                            <p className="text-xs font-black text-foreground truncate">{item.teacher?.name || "---"}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-500/5 border border-border/50">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.dashboards.student_count}</p>
                                            <p className="text-xs font-black text-foreground">{item._count.students}</p>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/dashboard/admin/classes/${item.id}`}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-500/5 group-hover:bg-primary group-hover:text-white border border-border group-hover:border-primary rounded-2xl text-xs font-black transition-all"
                                    >
                                        {t.dashboards.view_profile}
                                        <ArrowUpRight size={14} className={dir === 'rtl' ? 'rotate-[-90deg]' : ''} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl shadow-xl">
                            <div className="overflow-x-auto">
                                <table className={`w-full ${dir === 'rtl' ? 'text-right' : 'text-left'} border-collapse`}>
                                    <thead>
                                        <tr className="bg-slate-500/5 border-b border-border">
                                            <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.dashboards.class_name}</th>
                                            <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.dashboards.gender}</th>
                                            <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.dashboards.homeroom_teacher}</th>
                                            <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.dashboards.student_count}</th>
                                            <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredClasses.map((item: any) => (
                                            <tr key={item.id} className="group hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/admin/classes/${item.id}`)}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                            <School size={20} />
                                                        </div>
                                                        <span className="text-sm font-black text-foreground">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${item.gender === 'BOYS' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : item.gender === 'GIRLS' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                        {item.gender === 'BOYS' ? t.dashboards.gender_boys : item.gender === 'GIRLS' ? t.dashboards.gender_girls : t.dashboards.gender_mixed}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-500">{item.teacher?.name || "---"}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-black text-foreground">{item._count.students}</span>
                                                </td>
                                                <td className={`px-6 py-4 ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                                                    <Link href={`/dashboard/admin/classes/${item.id}`} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-primary hover:text-white transition-all inline-block">
                                                        <ArrowUpRight size={16} className={dir === 'rtl' ? 'rotate-[-90deg]' : ''} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center bg-card/40 backdrop-blur-xl rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10 text-center space-y-4">
                        <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
                            <Search size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">{t.dashboards.no_results}</h3>
                            <p className="text-sm font-bold text-slate-500 mt-1 max-w-xs mx-auto">Try adjusting your search terms to find the class you are looking for.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
