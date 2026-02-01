"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
    UserCheck,
    BookOpen,
    Shield
} from "lucide-react";
import Link from "next/link";

export default function NewClassPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, dir } = useLanguage();

    // Options
    const [teachers, setTeachers] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        templateId: "",
        name: "",
        level: "",
        section: "",
        gender: "",
        academicYear: "1403", // Default year
        teacherId: "",
        subjectIds: [] as string[],
        studentIds: [] as string[]
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [studentSearchTerm, setStudentSearchTerm] = useState("");

    const fetchInitialData = async () => {
        try {
            const [teacherRes, studentRes, classRes] = await Promise.all([
                fetch("/api/admin/teachers"),
                fetch("/api/admin/available-students"),
                fetch("/api/classes")
            ]);

            if (teacherRes.ok) setTeachers(await teacherRes.json());
            if (studentRes.ok) setAvailableStudents(await studentRes.json());
            if (classRes.ok) {
                const allClasses = await classRes.json();
                // Filter templates (classes created by SuperAdmin)
                // We'll rely on the creator property if available, 
                // but since the API might not include it yet, 
                // we'll assume any class that ISN'T created by the current user 
                // and has no teacher might be a template. 
                // Better yet, let's just show all available classes as potential templates 
                // but exclude the ones already "active" if possible.
                // For now, any class from SuperAdmin.
                setTemplates(allClasses);
            }

        } catch (err) {
            console.error("Failed to load options");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN") {
            router.push("/");
        }

        if (session) {
            fetchInitialData();
        }
    }, [status, session, router]);

    const handleTemplateChange = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setFormData(prev => ({
                ...prev,
                templateId,
                name: template.name,
                level: template.level,
                section: template.section,
                gender: template.gender,
                subjectIds: template.subjects.map((s: any) => s.id)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                templateId: "",
                name: "",
                level: "",
                section: "",
                gender: "",
                subjectIds: []
            }));
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
        if (!formData.templateId) {
            setError("Please select a class template");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/admin/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/dashboard/admin/classes"), 2000);
            } else {
                const data = await res.json();
                setError(data.message || "Failed to create class");
            }
        } catch (err) {
            setError("Something went wrong");
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

    return (
        <div className="font-sans pb-12">
            <div className={`fixed -top-24 ${dir === 'rtl' ? '-right-24' : '-left-24'} h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-pulse pointer-events-none`}></div>

            <div className="container mx-auto px-4 md:px-8 py-8 relative z-10">
                <header className="mb-10 flex items-center gap-4">
                    <Link href="/dashboard/admin/classes" className="p-3 bg-card border border-border rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm group">
                        <ArrowLeft size={20} className={`transition-transform ${dir === 'rtl' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                    </Link>
                    <div className="text-start">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t.dashboards.admin}</h2>
                        <h1 className="text-3xl font-black tracking-tight">{t.dashboards.add_class}</h1>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Template Selection & Teacher */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-8">
                            <h3 className="flex items-center gap-3 text-xl font-black text-start">
                                <Shield className="text-primary" />
                                Class Template
                            </h3>

                            <div className="space-y-6 text-start">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Select SuperAdmin Class *</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                        value={formData.templateId}
                                        onChange={(e) => handleTemplateChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose a class...</option>
                                        {templates.map((tpl) => (
                                            <option key={tpl.id} value={tpl.id}>
                                                {tpl.level} - {tpl.name} ({tpl.section})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {formData.templateId && (
                                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-slate-500">Level:</span>
                                            <span className="text-xs font-black text-primary">{t.levels[formData.level] || formData.level}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-slate-500">Section:</span>
                                            <span className="text-xs font-black text-primary">{formData.section}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-slate-500">Gender:</span>
                                            <span className="text-xs font-black text-primary">{formData.gender}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Academic Year *</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                        value={formData.academicYear}
                                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                        required
                                    >
                                        <option value="1402">1402</option>
                                        <option value="1403">1403</option>
                                        <option value="1404">1404</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.dashboards.homeroom_teacher}</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                                        value={formData.teacherId}
                                        onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                    >
                                        <option value="">{t.dashboards.class_details.select_teacher}</option>
                                        {teachers.map((teach: any) => (
                                            <option key={teach.id} value={teach.id}>{teach.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Subjects Display (Auto-filled) */}
                        <div className="p-8 rounded-[2rem] bg-card/60 border border-border flex flex-col gap-4 text-start">
                            <div className="flex items-center gap-2 text-primary">
                                <BookOpen size={20} />
                                <h4 className="font-black text-sm uppercase tracking-wide">{t.dashboards.subjects}</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.subjectIds.length > 0 ? (
                                    formData.subjectIds.map((subId: string) => {
                                        const template = templates.find(t => t.id === formData.templateId);
                                        const subject = template?.subjects?.find((s: any) => s.id === subId);
                                        return (
                                            <span key={subId} className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
                                                {subject?.name || subId}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <p className="text-[10px] font-bold text-slate-400 italic">Subjects will be imported from template</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Student Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-6 flex flex-col h-[600px]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h3 className="flex items-center gap-3 text-xl font-black text-start">
                                    <Users className="text-cyan-500" />
                                    {t.dashboards.select_available_students} ({formData.studentIds.length})
                                </h3>
                                <div className="relative group w-full md:max-w-xs">
                                    <Search size={16} className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-slate-400 my-auto`} />
                                    <input
                                        type="text"
                                        placeholder={t.dashboards.search_placeholder}
                                        className={`w-full bg-slate-500/5 border border-border rounded-xl py-2 ${dir === 'rtl' ? 'pr-10' : 'pl-10'} pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20`}
                                        value={studentSearchTerm}
                                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {filteredStudents.length > 0 ? filteredStudents.map((student: any) => (
                                    <div
                                        key={student.id}
                                        onClick={() => toggleStudent(student.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${formData.studentIds.includes(student.id) ? 'bg-primary/10 border-primary shadow-sm' : 'bg-slate-500/5 border-transparent hover:border-slate-300 dark:hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${formData.studentIds.includes(student.id) ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                                                {formData.studentIds.includes(student.id) ? <Check size={20} /> : <UserCheck size={20} />}
                                            </div>
                                            <div className="text-start">
                                                <p className="text-sm font-black text-foreground">{student.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 tracking-wider">ID: {student.studentId} • F: {student.fatherName}</p>
                                            </div>
                                        </div>
                                        {formData.studentIds.includes(student.id) && (
                                            <span className="text-[10px] font-black text-primary animate-in fade-in slide-in-from-right-2">{t.dashboards.new_class.selected_badge}</span>
                                        )}
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 italic font-bold">
                                        {t.dashboards.no_results}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col md:flex-row items-center justify-end gap-6 text-start">
                            {error && <div className="text-red-500 font-bold flex items-center gap-2 animate-pulse"><XCircle size={20} />{error}</div>}
                            {success && <div className="text-emerald-500 font-bold flex items-center gap-2"><CheckCircle size={20} />{t.dashboards.new_class.success_msg}</div>}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full md:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-primary px-12 py-5 text-lg font-black text-white shadow-2xl shadow-primary/40 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                            >
                                {submitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                {t.dashboards.add_class}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.5); }
            `}</style>
        </div>
    );
}
