"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    ArrowLeft,
    Save,
    User as UserIcon,
    Trash2,
    Shield,
    MapPin,
    Camera,
    CheckCircle,
    XCircle,
    Loader2,
    AlertTriangle,
    Download
} from "lucide-react";
import { useRef } from "react";
import Link from "next/link";

export default function StudentProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        fatherName: "",
        grandfatherName: "",
        studentId: "",
        surname: "",
        tazkiraNo: "",
        nameEn: "",
        fatherNameEn: "",
        grandfatherNameEn: "",
        surnameEn: "",
        permanentAddress: "",
        currentAddress: "",
        paternalUncle: "",
        maternalUncle: "",
        paternalCousin: "",
        maternalCousin: "",
        email: "",
        image: "",
        qrCode: ""
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN") {
            router.push("/");
        }

        if (session && params.id) {
            fetchStudent();
        }
    }, [status, session, router, params.id]);

    const fetchStudent = async () => {
        try {
            const res = await fetch(`/api/admin/students/${params.id}`);
            const data = await res.json();

            if (res.ok) {
                setFormData({
                    name: data.name || "",
                    fatherName: data.fatherName || "",
                    grandfatherName: data.grandfatherName || "",
                    studentId: data.studentId || "",
                    surname: data.surname || "",
                    tazkiraNo: data.tazkiraNo || "",
                    nameEn: data.nameEn || "",
                    fatherNameEn: data.fatherNameEn || "",
                    grandfatherNameEn: data.grandfatherNameEn || "",
                    surnameEn: data.surnameEn || "",
                    permanentAddress: data.permanentAddress || "",
                    currentAddress: data.currentAddress || "",
                    paternalUncle: data.paternalUncle || "",
                    maternalUncle: data.maternalUncle || "",
                    paternalCousin: data.paternalCousin || "",
                    maternalCousin: data.maternalCousin || "",
                    email: data.email || "",
                    image: data.image || "",
                    qrCode: data.qrCode || ""
                });
            } else {
                setError(`${data.message || "Could not load student data"} (Status: ${res.status})`);
            }
        } catch (err) {
            setError("Failed to fetch student profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const handleDownloadQR = () => {
        if (!formData.qrCode) return;

        const link = document.createElement('a');
        link.href = formData.qrCode;
        link.download = `QR_${formData.studentId || formData.name}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch(`/api/admin/students/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await res.json();
                setError(data.message || "Failed to update student");
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
            const res = await fetch(`/api/admin/students/${params.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/dashboard/admin");
            } else {
                setError("Failed to delete student");
                setShowDeleteModal(false);
            }
        } catch (err) {
            setError("Something went wrong during deletion");
        } finally {
            setSubmitting(false);
        }
    };

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
            <div className={`fixed -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-600/10 dark:bg-cyan-600/10 blur-[120px] animate-pulse pointer-events-none`}></div>

            <div className="container mx-auto px-4 md:px-8 py-8 relative z-10">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/admin" className="p-3 bg-card border border-border rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t.roles.STUDENT} Profile</h2>
                            <h1 className="text-3xl font-black tracking-tight">{formData.name} {formData.surname}</h1>
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

                    {/* Sidebar: Photo & Essential ID */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border flex flex-col items-center text-center shadow-xl">
                            <div className="relative group">
                                <div className="h-40 w-40 rounded-[2rem] bg-slate-100 dark:bg-slate-800 border-4 border-primary/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Student" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserIcon size={64} className={`text-slate-400 ${uploading ? 'animate-pulse' : ''}`} />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Loader2 size={32} className="animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-all"
                                >
                                    <Camera size={20} />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <div className="mt-6 w-full space-y-4 text-left">
                                <div className="space-y-1">
                                    <label htmlFor="studentId" className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">{t.student_registration.student_id}</label>
                                    <input
                                        type="text" id="studentId" value={formData.studentId} onChange={handleChange} required
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="tazkiraNo" className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">{t.student_registration.tazkira_no}</label>
                                    <input
                                        type="text" id="tazkiraNo" value={formData.tazkiraNo} onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* QR Code Section */}
                            {formData.qrCode && (
                                <div className="mt-6 pt-6 border-t border-border">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-white rounded-2xl shadow-lg">
                                            <img
                                                src={formData.qrCode}
                                                alt="Student QR Code"
                                                className="w-48 h-48"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDownloadQR}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                                        >
                                            <Download size={20} />
                                            {t.dashboards.download_qr_code}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content: Info Tabs/Sections */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Section 1: Local Info */}
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-8">
                            <h3 className="flex items-center gap-3 text-xl font-black">
                                <UserIcon className="text-cyan-500" />
                                {(t.dashboards as any).local_profile_title}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.student_registration.name_dr} *</label>
                                    <input type="text" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="surname" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.student_registration.surname_dr}</label>
                                    <input type="text" id="surname" value={formData.surname} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="fatherName" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.student_registration.father_name_dr}</label>
                                    <input type="text" id="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="grandfatherName" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.student_registration.grandfather_name_dr}</label>
                                    <input type="text" id="grandfatherName" value={formData.grandfatherName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: English Info */}
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-8">
                            <h3 className="flex items-center gap-3 text-xl font-black">
                                <Shield className="text-purple-500" />
                                {(t.dashboards as any).english_profile_title}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="nameEn" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.student_registration.name_en}</label>
                                    <input type="text" id="nameEn" value={formData.nameEn} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="surnameEn" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.student_registration.surname_en}</label>
                                    <input type="text" id="surnameEn" value={formData.surnameEn} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="fatherNameEn" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.student_registration.father_name_en}</label>
                                    <input type="text" id="fatherNameEn" value={formData.fatherNameEn} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="grandfatherNameEn" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.student_registration.grandfather_name_en}</label>
                                    <input type="text" id="grandfatherNameEn" value={formData.grandfatherNameEn} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-base font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all" dir="ltr" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Relatives & Addresses */}
                        <div className="p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-border shadow-xl space-y-8">
                            <h3 className="flex items-center gap-3 text-xl font-black">
                                <MapPin className="text-emerald-500" />
                                {(t.dashboards as any).relatives_addresses_title}
                            </h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="permanentAddress" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.student_registration.permanent_address}</label>
                                        <textarea id="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-20 resize-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="currentAddress" className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">{t.student_registration.current_address}</label>
                                        <textarea id="currentAddress" value={formData.currentAddress} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-20 resize-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { id: 'paternalUncle', key: 'paternal_uncle' },
                                        { id: 'maternalUncle', key: 'maternal_uncle' },
                                        { id: 'paternalCousin', key: 'paternal_cousin' },
                                        { id: 'maternalCousin', key: 'maternal_cousin' }
                                    ].map((rel) => (
                                        <div key={rel.id} className="space-y-2">
                                            <label htmlFor={rel.id} className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">{(t.student_registration as any)[rel.key]}</label>
                                            <input type="text" id={rel.id} value={(formData as any)[rel.id]} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Final Actions */}
                        <div className="flex flex-col md:flex-row items-center justify-end gap-6">
                            {error && <div className="text-red-500 font-bold flex items-center gap-2 animate-pulse"><XCircle size={20} />{error}</div>}
                            {success && <div className="text-emerald-500 font-bold flex items-center gap-2"><CheckCircle size={20} />{t.dashboards.save_changes} Successfully!</div>}

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
        </div>
    );
}
