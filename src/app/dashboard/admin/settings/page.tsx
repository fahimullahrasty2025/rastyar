"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    Save,
    Loader2,
    CheckCircle,
    Image,
    Type,
    FileText,
    PenTool
} from "lucide-react";

export default function settingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, dir } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [settings, setSettings] = useState({
        schoolName: "",
        headerTitle1: "",
        headerTitle2: "",
        headerTitle3: "",
        logoLeft: "",
        logoRight: "",
        signatureLabel1: "",
        signatureLabel2: "",
        signatureLabel3: "",
        signatureLabel4: "",
        signatureLabel5: "",
        signatureLabel6: "",
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN") {
            router.push("/");
        }

        if (session) {
            fetchSettings();
        }
    }, [status, session]);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        setSuccess(false);
        setError("");

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError("Failed to save settings");
            }
        } catch (err) {
            setError("Error saving settings");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="mb-10 text-start">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 mb-1">{t.dashboards.settings}</h2>
                <h1 className="text-3xl font-black tracking-tight">تنظیمات مکتب و جدول نتایج</h1>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {/* General Info */}
                <section className="bg-card border border-border rounded-[2rem] p-8 shadow-xl">
                    <h3 className="flex items-center gap-3 text-lg font-black mb-6 text-start border-b border-border pb-4">
                        <Type className="text-cyan-500" />
                        عنوان‌های هدر (سربرگ)
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2 text-start">
                            <label className="text-xs font-black text-slate-500 uppercase">نام مکتب</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary outline-none"
                                value={settings.schoolName}
                                onChange={(e) => handleInputChange("schoolName", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 text-start">
                            <label className="text-xs font-black text-slate-500 uppercase">عنوان اول (مثلاً وزارت معارف)</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary outline-none"
                                value={settings.headerTitle1}
                                onChange={(e) => handleInputChange("headerTitle1", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 text-start">
                            <label className="text-xs font-black text-slate-500 uppercase">عنوان دوم (مثلاً ریاست معارف)</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary outline-none"
                                value={settings.headerTitle2}
                                onChange={(e) => handleInputChange("headerTitle2", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 text-start">
                            <label className="text-xs font-black text-slate-500 uppercase">عنوان سوم (مثلاً آمریت معارف)</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary outline-none"
                                value={settings.headerTitle3}
                                onChange={(e) => handleInputChange("headerTitle3", e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Logos */}
                <section className="bg-card border border-border rounded-[2rem] p-8 shadow-xl">
                    <h3 className="flex items-center gap-3 text-lg font-black mb-6 text-start border-b border-border pb-4">
                        <Image className="text-purple-500" />
                        لوگوها
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-500 uppercase block text-start">لوگو سمت راست</label>
                            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-border rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                {settings.logoRight ? (
                                    <img src={settings.logoRight} className="h-32 w-auto object-contain" />
                                ) : (
                                    <Image size={48} className="text-slate-300" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload("logoRight", e)}
                                    className="hidden"
                                    id="logoRight"
                                />
                                <label htmlFor="logoRight" className="cursor-pointer px-4 py-2 bg-white border border-border rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all">تغییر لوگو</label>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-500 uppercase block text-start">لوگو سمت چپ</label>
                            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-border rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                {settings.logoLeft ? (
                                    <img src={settings.logoLeft} className="h-32 w-auto object-contain" />
                                ) : (
                                    <Image size={48} className="text-slate-300" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload("logoLeft", e)}
                                    className="hidden"
                                    id="logoLeft"
                                />
                                <label htmlFor="logoLeft" className="cursor-pointer px-4 py-2 bg-white border border-border rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition-all">تغییر لوگو</label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Signatures */}
                <section className="bg-card border border-border rounded-[2rem] p-8 shadow-xl">
                    <h3 className="flex items-center gap-3 text-lg font-black mb-6 text-start border-b border-border pb-4">
                        <PenTool className="text-emerald-500" />
                        عنواین امضاءها
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(num => (
                            <div key={num} className="space-y-2 text-start">
                                <label className="text-xs font-black text-slate-500 uppercase">امضا {num}</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary outline-none"
                                    value={(settings as any)[`signatureLabel${num}`] || ""}
                                    onChange={(e) => handleInputChange(`signatureLabel${num}`, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={handleSave}
                        disabled={submitting}
                        className={`flex items-center gap-2 px-10 py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(6,182,212,0.3)] font-black active:scale-95 ${success ? 'bg-emerald-500 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}
                    >
                        {submitting ? <Loader2 size={24} className="animate-spin" /> : success ? <CheckCircle size={24} /> : <Save size={24} />}
                        {success ? "ذخیره شد!" : "ذخیره تمام تنظیمات"}
                    </button>
                    {error && <p className="text-red-500 font-bold self-center">{error}</p>}
                </div>
            </div>
        </div>
    );
}
