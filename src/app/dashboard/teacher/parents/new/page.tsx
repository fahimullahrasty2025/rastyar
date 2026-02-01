"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    ArrowLeft,
    Save,
    User,
    Camera,
    Info,
    CheckCircle,
    XCircle,
    Loader2,
    Search,
    Users as UsersIcon,
    Briefcase,
    Mail,
    Lock,
    Phone,
    Plus,
    X
} from "lucide-react";
import Link from "next/link";

export default function TeacherParentRegistration() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, dir } = useLanguage();

    // UI State
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Students context
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [showStudentPicker, setShowStudentPicker] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "PARENT",
        phone: "",
        jobTitle: "",
        image: ""
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "TEACHER") {
            router.push("/");
        }

        if (session) {
            fetchStudents();
        }
    }, [status, session, router]);

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/admin/students");
            if (res.ok) {
                const data = await res.json();
                // We want to show students who don't have parents assigned? 
                // For now just show all for selection as requested.
                setAvailableStudents(data);
            }
        } catch (err) {
            console.error("Error fetching students:", err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            });

            if (res.ok) {
                const data = await res.json();
                setFormData({ ...formData, image: data.url });
            } else {
                setError("Failed to upload image");
            }
        } catch (err) {
            setError("Error uploading file");
        } finally {
            setUploading(false);
        }
    };

    const handleAddStudent = (student: any) => {
        if (!selectedStudents.find(s => s.id === student.id)) {
            setSelectedStudents([...selectedStudents, student]);
        }
    };

    const handleRemoveStudent = (studentId: string) => {
        setSelectedStudents(selectedStudents.filter(s => s.id !== studentId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            // Include child IDs in the request
            const submissionData = {
                ...formData,
                childIds: selectedStudents.map(s => s.id)
            };

            const res = await fetch("/api/admin/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submissionData),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/dashboard/teacher"), 2000);
            } else {
                const data = await res.json();
                setError(data.message || "Failed to register parent");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return null;

    const filteredStudents = availableStudents.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`font-sans pb-12 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            {/* Ambient Background Blobs */}
            <div className={`fixed -top-24 ${dir === 'rtl' ? '-right-24' : '-left-24'} h-96 w-96 rounded-full bg-purple-600/10 blur-[120px] animate-pulse pointer-events-none`}></div>

            <div className="container mx-auto px-4 md:px-8 py-8 relative z-10">
                <header className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/teacher" className="p-3 bg-card border border-border rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm group">
                            <ArrowLeft size={20} className={`${dir === 'rtl' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'} transition-transform`} />
                        </Link>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500">{t.roles.PARENT}</h2>
                            <h1 className="text-3xl font-black tracking-tight">{t.dashboards.manage_students.split('/')[1]}</h1>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: General Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-8">
                            <h3 className="flex items-center gap-3 text-xl font-black">
                                <User className="text-purple-500" />
                                {t.dashboards.financial_info}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.register_page.name} *</label>
                                    <input type="text" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.dashboards.phone}</label>
                                    <input type="text" id="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.register_page.email}</label>
                                    <input type="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all" placeholder="Optional" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.register_page.password} *</label>
                                    <input type="password" id="password" value={formData.password} onChange={handleChange} required className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Child Selection Section */}
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-3 text-xl font-black">
                                    <UsersIcon className="text-cyan-500" />
                                    {t.roles.STUDENT} (Children)
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowStudentPicker(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 rounded-xl text-xs font-black hover:bg-slate-200 transition-all"
                                >
                                    <Plus size={16} /> Select Children
                                </button>
                            </div>

                            {selectedStudents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedStudents.map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-border rounded-[1.5rem] group hover:border-cyan-500 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
                                                    {student.image && <img src={student.image} className="h-full w-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black">{student.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500">{student.studentId} | {student.currentClass?.name || 'No Class'}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStudent(student.id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-slate-50/50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center gap-3">
                                    <UsersIcon className="text-slate-300" size={40} />
                                    <p className="text-sm font-bold text-slate-500">No children selected yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Submit Section */}
                        <div className="flex flex-col md:flex-row items-center justify-end gap-6">
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 font-bold animate-pulse">
                                    <XCircle size={20} />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 text-emerald-500 font-bold">
                                    <CheckCircle size={20} />
                                    Successfully Registered!
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto flex items-center justify-center gap-3 rounded-[1.5rem] bg-purple-600 px-12 py-5 text-lg font-black text-white shadow-2xl shadow-purple-500/40 transition-all hover:bg-purple-700 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                            >
                                {loading ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                                Register Parent
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Photo */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border flex flex-col items-center text-center shadow-xl">
                            <div className="relative group">
                                <div className="h-40 w-40 rounded-[2rem] bg-slate-100 dark:bg-slate-800 border-4 border-purple-500/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-purple-500">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Parent" className="h-full w-full object-cover" />
                                    ) : (
                                        <User size={64} className={`text-slate-400 ${uploading ? 'animate-pulse' : ''}`} />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Loader2 size={32} className="animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 p-3 bg-purple-500 text-white rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-all"
                                >
                                    <Camera size={20} />
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                            </div>
                            <div className="mt-6 w-full space-y-4">
                                <h4 className="font-black">Parent Profile Photo</h4>
                                <p className="text-xs font-bold text-slate-500">Suggested: A clear frontal portrait.</p>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-purple-500/5 border border-purple-500/10 space-y-4">
                            <div className="flex items-center gap-3 text-purple-500">
                                <Info size={20} />
                                <h4 className="font-black text-sm uppercase tracking-widest">Parent Role</h4>
                            </div>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                As a teacher, you are registering a Parent account. This account will have access to see their linked children's grades and attendance.
                            </p>
                        </div>
                    </div>
                </form>
            </div>

            {/* Student Picker Modal */}
            {showStudentPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-card border border-border rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                        <div className="p-8 border-b border-border flex items-center justify-between">
                            <h3 className="text-2xl font-black">Link Students</h3>
                            <button onClick={() => setShowStudentPicker(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X /></button>
                        </div>

                        <div className="p-8 bg-slate-50/50 flex-1 flex flex-col gap-6 overflow-hidden">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name or Student ID..."
                                    className="w-full pl-12 pr-6 py-4 bg-white dark:bg-white/5 border border-border rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {filteredStudents.map(student => {
                                    const isSelected = selectedStudents.some(s => s.id === student.id);
                                    return (
                                        <div
                                            key={student.id}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected ? 'border-purple-500 bg-purple-500/5' : 'border-border bg-white hover:border-purple-200'}`}
                                            onClick={() => isSelected ? handleRemoveStudent(student.id) : handleAddStudent(student)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden border border-border">
                                                    {student.image && <img src={student.image} className="h-full w-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black">{student.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500">{student.studentId} • {student.currentClass?.name || 'Classless'}</p>
                                                </div>
                                            </div>
                                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-slate-300'}`}>
                                                {isSelected && <CheckCircle className="text-white" size={14} />}
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <div className="py-20 text-center opacity-50 italic">No students found.</div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-border bg-slate-50 flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-500">{selectedStudents.length} selected</p>
                            <button
                                onClick={() => setShowStudentPicker(false)}
                                className="px-10 py-4 bg-purple-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-purple-700 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
