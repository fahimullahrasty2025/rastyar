"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    ArrowLeft,
    Save,
    School,
    Users,
    Search,
    Loader2,
    CheckCircle,
    XCircle,
    Check,
    Trash2,
    AlertTriangle,
    UserCheck,
    BookOpen,
    Camera
} from "lucide-react";
import Link from "next/link";

export default function ClassDetailPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const { t, dir } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Options
    const [teachers, setTeachers] = useState<any[]>([]);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);

    // Class Data
    const [classData, setClassData] = useState<any>(null);
    const [formData, setFormData] = useState({
        section: "",
        gender: "",
        teacherId: "",
        studentIds: [] as string[]
    });

    const [studentSearchTerm, setStudentSearchTerm] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN") {
            router.push("/");
        }

        if (session && params.id) {
            fetchInitialData();
        }
    }, [status, session, router, params.id]);

    const fetchInitialData = async () => {
        try {
            const [classRes, teacherRes, availableStudentRes] = await Promise.all([
                fetch(`/api/admin/classes/${params.id}`),
                fetch("/api/admin/teachers"),
                fetch("/api/admin/available-students")
            ]);

            let currentClassData = null;

            if (classRes.ok) {
                const data = await classRes.json();
                currentClassData = data;
                setClassData(data);
                setFormData({
                    section: data.section,
                    gender: data.gender,
                    teacherId: data.teacherId || "",
                    studentIds: data.students.map((s: any) => s.id)
                });
            } else {
                const errorData = await classRes.json().catch(() => ({}));
                setError(`Class not found: ${errorData.message || classRes.statusText}`);
                setLoading(false);
                return;
            }

            if (teacherRes.ok) {
                setTeachers(await teacherRes.json());
            }

            if (availableStudentRes.ok) {
                const avail = await availableStudentRes.json();
                // Combine currently enrolled students with other available students
                if (currentClassData) {
                    setAvailableStudents([...currentClassData.students, ...avail]);
                } else {
                    setAvailableStudents(avail);
                }
            }

        } catch (err: any) {
            console.error("Load Class Details Error:", err);
            setError(`Error: ${err.message || "Failed to load class details"}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleStudent = (id: string) => {
        setFormData(prev => ({
            ...prev,
            studentIds: prev.studentIds.includes(id)
                ? prev.studentIds.filter(sId => sId !== id)
                : [...prev.studentIds, id]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch(`/api/admin/classes/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    level: classData.level // Keep existing level
                }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await res.json();
                setError(data.message || "Failed to update class");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/classes/${params.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/dashboard/admin/classes");
            } else {
                setError("Failed to delete class");
                setShowDeleteModal(false);
            }
        } catch (err) {
            setError("Error during deletion");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = availableStudents.filter((s: any) =>
        s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!classData) return <div className="p-20 text-center font-black">Class Not Found</div>;

    return (
        <div className="font-sans pb-12">
            <div className={`fixed -top-24 ${dir === 'rtl' ? '-right-24' : '-left-24'} h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px] animate-pulse pointer-events-none`}></div>

            <div className="container mx-auto px-4 md:px-8 py-8 relative z-10">

                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/admin/classes" className="p-3 bg-card border border-border rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm group">
                            <ArrowLeft size={20} className={`transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                        </Link>
                        <div className="text-start">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">{classData.level} {t.dashboards.view_profile}</h2>
                            <h1 className="text-3xl font-black tracking-tight">{classData.name}</h1>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                        <Trash2 size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-1 space-y-6">

                        {/* Class Identity Card */}
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-8">
                            <h3 className="flex items-center gap-3 text-xl font-black text-start">
                                <School className="text-primary" />
                                {t.dashboards.class_identity}
                            </h3>

                            <div className="space-y-6 text-start">
                                <div className="p-4 rounded-2xl bg-slate-500/5 border border-border/50">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.dashboards.class_details.fixed_level}</p>
                                    <p className="text-sm font-black text-foreground">{classData.level}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.dashboards.class_section}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                        value={formData.section}
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.dashboards.gender}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['BOYS', 'GIRLS', 'MIXED'].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, gender: g })}
                                                className={`py-3 rounded-xl text-[10px] font-black border transition-all ${formData.gender === g ? 'bg-primary text-white border-primary shadow-lg' : 'bg-slate-500/5 text-slate-500 border-border'}`}
                                            >
                                                {g === 'BOYS' ? t.dashboards.gender_boys : g === 'GIRLS' ? t.dashboards.gender_girls : t.dashboards.gender_mixed}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.dashboards.homeroom_teacher}</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.teacherId}
                                        onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                    >
                                        <option value="">{t.dashboards.class_details.select_teacher}</option>
                                        {teachers.map((t: any) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Automatic Subjects Card */}
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-6">
                            <h3 className="flex items-center gap-3 text-xl font-black text-start">
                                <BookOpen className="text-purple-500" />
                                {t.dashboards.subjects}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {classData.subjects.map((sub: any) => (
                                    <span key={sub.id} className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-black border border-purple-500/20">
                                        {sub.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6 text-start">

                        {/* Student Management Card */}
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-6 flex flex-col min-h-[500px]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h3 className="flex items-center gap-3 text-xl font-black">
                                    <Users className="text-cyan-500" />
                                    {t.dashboards.class_details.managed_roster} ({formData.studentIds.length})
                                </h3>
                                <div className="relative group w-full md:max-w-xs">
                                    <Search size={16} className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-slate-400 my-auto`} />
                                    <input
                                        type="text"
                                        placeholder={t.dashboards.class_details.search_students}
                                        className={`w-full bg-slate-500/5 border border-border rounded-xl py-2 ${dir === 'rtl' ? 'pr-10' : 'pl-10'} pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20`}
                                        value={studentSearchTerm}
                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                                {filteredStudents.length > 0 ? filteredStudents.map((student: any) => (
                                    <div
                                        key={student.id}
                                        onClick={() => toggleStudent(student.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${formData.studentIds.includes(student.id) ? 'bg-primary/10 border-primary shadow-sm' : 'bg-slate-500/5 border-transparent hover:border-slate-300 dark:hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-white/10 flex items-center justify-center border border-border">
                                                {student.image ? (
                                                    <img src={student.image} alt={student.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <UserCheck size={20} className="text-slate-400" />
                                                )}
                                            </div>
                                            <div className="text-start">
                                                <p className="text-sm font-black text-foreground">{student.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-0.5">ID: {student.studentId} • F: {student.fatherName}</p>
                                            </div>
                                        </div>
                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center border transition-all ${formData.studentIds.includes(student.id) ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-transparent border-slate-300 dark:border-white/10'}`}>
                                            {formData.studentIds.includes(student.id) && <Check size={14} />}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center text-slate-500 italic font-bold">{t.dashboards.no_results}</div>
                                )}
                            </div>
                        </div>

                        {/* Save Changes Footer */}
                        <div className="flex flex-col md:flex-row items-center justify-end gap-6">
                            {error && <div className="text-red-500 font-bold flex items-center gap-2 animate-pulse"><XCircle size={20} />{error}</div>}
                            {success && <div className="text-emerald-500 font-bold flex items-center gap-2"><CheckCircle size={20} />{t.dashboards.save_changes} !</div>}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full md:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-primary px-12 py-5 text-lg font-black text-white shadow-2xl shadow-primary/40 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                            >
                                {submitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                {t.dashboards.save_changes}
                            </button>
                        </div>

                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="relative bg-card border border-border rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-center mb-2">{t.dashboards.class_details.delete_title}</h3>
                        <p className="text-slate-500 text-center text-sm font-bold mb-8">
                            {t.dashboards.class_details.delete_confirm} <strong>{classData.name}</strong>.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-sm">{t.dashboards.class_details.cancel}</button>
                            <button onClick={handleDelete} disabled={submitting} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-500/30">
                                {submitting ? '...' : t.dashboards.class_details.delete_btn}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.5); }
            `}</style>
        </div>
    );
}
