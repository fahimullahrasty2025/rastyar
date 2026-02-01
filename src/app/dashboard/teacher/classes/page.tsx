"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    Users,
    GraduationCap,
    ArrowRight,
    Loader2,
    BookOpen,
    Search
} from "lucide-react";
import Link from "next/link";

export default function TeacherClassesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, dir } = useLanguage();
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "TEACHER") {
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
            console.error("Error fetching classes:", err);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.level.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">{t.dashboards.classes}</h1>
                    <p className="text-slate-500 font-bold">Manage your assigned levels and input student grades.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search classes..."
                        className="w-full pl-12 pr-6 py-3 bg-card border border-border rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((schoolClass) => (
                    <div
                        key={schoolClass.id}
                        className="group bg-card border border-border rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-start justify-between mb-6">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <GraduationCap size={28} />
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${schoolClass.gender === 'BOYS' ? 'bg-blue-100 text-blue-600' :
                                        schoolClass.gender === 'GIRLS' ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'
                                    }`}>
                                    {schoolClass.gender}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black mb-1 group-hover:text-emerald-500 transition-colors uppercase">{schoolClass.name}</h3>
                            <p className="text-sm font-bold text-slate-500 mb-6">{schoolClass.level} • {schoolClass.section}</p>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-slate-400" />
                                    <span className="text-xs font-black">{schoolClass._count?.students || 0} Students</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/dashboard/teacher/classes/${schoolClass.id}/grading`}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all group-hover:scale-[1.02] active:scale-95"
                        >
                            <BookOpen size={20} />
                            Grade Students
                            <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ))}

                {filteredClasses.length === 0 && !loading && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-border">
                        <Users size={48} className="opacity-20" />
                        <p className="font-bold">No classes found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
