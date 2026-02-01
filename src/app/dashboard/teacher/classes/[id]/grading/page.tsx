"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    ArrowLeft,
    Save,
    Loader2,
    CheckCircle,
    XCircle,
    BookOpen,
    User,
    FileSpreadsheet,
    ClipboardList,
    Printer,
    Users as UsersIcon
} from "lucide-react";
import Link from "next/link";

export default function TeacherGradingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const { t, dir } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [classData, setClassData] = useState<any>(null);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedType, setSelectedType] = useState("MIDTERM"); // MIDTERM, FINAL
    const [grades, setGrades] = useState<Record<string, string>>({});

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "TEACHER") {
            router.push("/");
        }

        if (session && params.id) {
            fetchClassData();
        }
    }, [status, session, router, params.id]);

    const fetchClassData = async () => {
        try {
            const res = await fetch(`/api/admin/classes/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setClassData(data);
                if (data.subjects && data.subjects.length > 0) {
                    setSelectedSubject(data.subjects[0].id);
                }
            } else {
                setError("Class not found");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load class");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSubject && selectedType && classData) {
            fetchGrades();
        }
    }, [selectedSubject, selectedType, classData]);

    const fetchGrades = async () => {
        try {
            const res = await fetch(`/api/grades?classId=${params.id}&subjectId=${selectedSubject}&type=${selectedType}`);
            if (res.ok) {
                const data = await res.json();
                const newGrades: Record<string, string> = {};
                data.forEach((g: any) => {
                    newGrades[g.studentId] = g.score.toString();
                });
                setGrades(newGrades);
            }
        } catch (err) {
            console.error("Failed to fetch grades");
        }
    };

    const handleGradeChange = (studentId: string, value: string) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSave = async () => {
        if (!selectedSubject) return;
        setSubmitting(true);
        setSuccess(false);
        setError("");

        try {
            const gradesArray = Object.entries(grades).map(([studentId, score]) => ({
                studentId,
                score
            })).filter(g => g.score !== "");

            const res = await fetch("/api/grades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classId: params.id,
                    subjectId: selectedSubject,
                    type: selectedType,
                    grades: gradesArray
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError("Failed to save grades");
            }
        } catch (err) {
            setError("Error saving grades");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        );
    }

    if (!classData) return <div className="p-20 text-center font-black">Class not found</div>;

    const subjects = classData.subjects || [];
    const students = classData.students || [];

    return (
        <div className="font-sans pb-12">
            <div className={`fixed -top-24 ${dir === 'rtl' ? '-right-24' : '-left-24'} h-96 w-96 rounded-full bg-emerald-600/10 blur-[120px] animate-pulse pointer-events-none`}></div>

            <div className="container mx-auto px-4 md:px-8 py-8 relative z-10">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/teacher/classes" className="p-3 bg-card border border-border rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm group">
                            <ArrowLeft size={20} className={`transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                        </Link>
                        <div className="text-start">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Grading System</h2>
                            <h1 className="text-3xl font-black tracking-tight">{classData.name} - Marks Entry</h1>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-8">
                            <h3 className="flex items-center gap-3 text-lg font-black text-start uppercase tracking-widest">
                                <ClipboardList className="text-emerald-500" />
                                Options
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2 text-start">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Selected Subject</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-[1.25rem] px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                    >
                                        {subjects.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3 text-start">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Exam Term</label>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => setSelectedType("MIDTERM")}
                                            className={`p-4 rounded-2xl text-xs font-black border transition-all flex items-center justify-between ${selectedType === 'MIDTERM' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-transparent border-border hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                        >
                                            {t.grading?.midterm}
                                            {selectedType === 'MIDTERM' && <CheckCircle size={14} />}
                                        </button>
                                        <button
                                            onClick={() => setSelectedType("FINAL")}
                                            className={`p-4 rounded-2xl text-xs font-black border transition-all flex items-center justify-between ${selectedType === 'FINAL' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-transparent border-border hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                        >
                                            {t.grading?.final}
                                            {selectedType === 'FINAL' && <CheckCircle size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-3 rounded-[1.5rem] bg-emerald-500 px-8 py-5 text-lg font-black text-white shadow-2xl shadow-emerald-500/40 transition-all hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                        >
                            {submitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                            {t.grading?.save_grades}
                        </button>
                    </div>

                    {/* Grading Results Table (Natayeg Style) */}
                    <div className="lg:col-span-3">
                        <div className="rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-2xl overflow-hidden p-1">
                            <div className="p-8 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between rounded-t-[2.25rem]">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    <UsersIcon className="text-emerald-500" />
                                    {t.grading?.student_list} ({students.length})
                                </h3>
                                {success && <span className="text-emerald-500 text-sm font-black flex items-center gap-2 animate-bounce"><CheckCircle size={18} /> {t.grading?.saved}</span>}
                            </div>

                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-start border-separate border-spacing-y-3">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <th className="px-6 pb-2 text-start">Student Information</th>
                                            <th className="px-6 pb-2 text-center w-32">Basis ID</th>
                                            <th className="px-6 pb-2 text-center w-40">Entry Score (0-100)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student: any) => (
                                            <tr key={student.id} className="group outline outline-1 outline-border rounded-xl hover:outline-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all">
                                                <td className="px-6 py-5 first:rounded-l-2xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-white/10 overflow-hidden border border-border shadow-sm">
                                                            {student.image ? <img src={student.image} className="h-full w-full object-cover" /> : <User className="h-full w-full p-2 text-slate-400" />}
                                                        </div>
                                                        <div className="flex flex-col text-start">
                                                            <span className="font-black text-slate-800 dark:text-slate-200">{student.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{student.fatherName || 'No Father Name'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center text-xs font-black text-slate-500 bg-slate-50/50 dark:bg-white/5">
                                                    {student.studentId}
                                                </td>
                                                <td className="px-6 py-5 last:rounded-r-2xl">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.5"
                                                            className="w-full bg-white dark:bg-slate-800 border-2 border-border rounded-xl px-4 py-3 text-lg font-black focus:border-emerald-500 outline-none text-center transition-all shadow-inner shadow-black/5"
                                                            placeholder="00.0"
                                                            value={grades[student.id] || ""}
                                                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 pointer-events-none uppercase">Pts</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {students.length === 0 && (
                                <div className="p-20 text-center flex flex-col items-center gap-4">
                                    <BookOpen size={48} className="text-slate-200" />
                                    <p className="text-slate-400 font-bold italic">{t.grading?.no_students}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
