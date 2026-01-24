"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Html5Qrcode } from "html5-qrcode";
import {
    QrCode,
    CheckCircle,
    XCircle,
    Camera,
    User,
    School,
    ArrowLeft,
    Loader2
} from "lucide-react";
import Link from "next/link";

export default function QRScannerPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, dir } = useLanguage();
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    const onScanSuccess = async (decodedText: string) => {
        // Stop scanning
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().then(() => {
                setScanning(false);
            }).catch(console.error);
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/scan-qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrData: decodedText })
            });

            const data = await res.json();

            if (data.success) {
                setResult(data.student);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to process QR code");
        } finally {
            setLoading(false);
        }
    };

    const onScanError = (error: any) => {
        // Ignore scan errors (they happen frequently during scanning)
    };

    const startScanning = async () => {
        setResult(null);
        setError("");
        setLoading(true);

        try {
            // We removed the hard check for isSecureContext to allow the browser to attempt access
            // Some mobile browsers might have flags enabled to allow this.
            
            const html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCodeRef.current = html5QrCode;

            // Using facingMode: "environment" is more reliable for mobile devices to get the rear camera
            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                onScanSuccess,
                onScanError
            );

            setScanning(true);
            setLoading(false);
        } catch (err: any) {
            console.error("Camera start error:", err);
            
            // Try fallback to any available camera if facingMode fails
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length > 0) {
                    const html5QrCode = html5QrCodeRef.current || new Html5Qrcode("qr-reader");
                    html5QrCodeRef.current = html5QrCode;
                    
                    await html5QrCode.start(
                        devices[0].id,
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 }
                        },
                        onScanSuccess,
                        onScanError
                    );
                    setScanning(true);
                    setLoading(false);
                    return;
                }
            } catch (fallbackErr) {
                console.error("Fallback camera error:", fallbackErr);
            }

            let errorMessage = (t.dashboards as any).camera_error_generic;
            const errStr = String(err).toLowerCase();
            
            if (errStr.includes("permission denied") || errStr.includes("notallowederror")) {
                errorMessage = (t.dashboards as any).camera_error_permission;
            } else if (errStr.includes("secure context") || !window.isSecureContext) {
                errorMessage = (t.dashboards as any).camera_error_security + 
                    (dir === 'rtl' ? " (نکته: در تنظیمات کروم گوشی، آی‌پی خود را در لیست سفید قرار دهید)" : " (Tip: Whitelist your IP in Chrome flags)");
            }

            setError(errorMessage);
            setLoading(false);
            setScanning(false);
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current = null;
                setScanning(false);
            } catch (err) {
                console.error("Error stopping camera:", err);
            }
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            {/* Background Effects */}
            <div className="fixed -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/20 dark:bg-cyan-600/10 blur-[120px] animate-pulse"></div>
            <div className="fixed top-1/2 -right-24 h-96 w-96 rounded-full bg-purple-400/10 dark:bg-purple-600/5 blur-[120px] animate-pulse"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/dashboard/${(session.user as any).role.toLowerCase()}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        {dir === 'rtl' ? 'بازگشت به داشبورد' : 'Back to Dashboard'}
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground flex items-center gap-3">
                        <QrCode className="text-primary" />
                        {t.dashboards.qr_scanner}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {t.dashboards.scan_qr}
                    </p>
                </div>

                {/* Scanner Section */}
                <div className="bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-xl">
                    {!scanning && !result && !loading && !error && (
                        <div className="text-center py-12">
                            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-6">
                                <Camera size={48} className="text-primary" />
                            </div>
                            <h2 className="text-2xl font-black mb-4">
                                {dir === 'rtl' ? 'آماده برای اسکن' : 'Ready to Scan'}
                            </h2>
                            <p className="text-slate-500 mb-8">
                                {dir === 'rtl' ? 'روی دکمه زیر کلیک کنید تا اسکن را شروع کنید' : 'Click the button below to start scanning'}
                            </p>
                            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-sm text-slate-600 dark:text-slate-400">
                                <p className="font-bold mb-2">
                                    {dir === 'rtl' ? '📱 نکته مهم:' : '📱 Important Note:'}
                                </p>
                                <p>
                                    {dir === 'rtl'
                                        ? 'هنگام باز شدن دوربین، به درخواست دسترسی مرورگر "اجازه دهید" بزنید'
                                        : 'When camera opens, click "Allow" on browser permission request'
                                    }
                                </p>
                            </div>
                            <button
                                onClick={startScanning}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                {t.dashboards.start_scanning}
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-12">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-slate-500">
                                {dir === 'rtl' ? 'در حال باز کردن دوربین...' : 'Opening camera...'}
                            </p>
                        </div>
                    )}

                    {scanning && (
                        <div>
                            <div id="qr-reader" className="rounded-2xl overflow-hidden w-full"></div>
                            <button
                                onClick={stopScanning}
                                className="mt-6 w-full px-6 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all"
                            >
                                {t.dashboards.stop_scanning}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 mb-6">
                                <XCircle size={48} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-black mb-4 text-red-500">
                                {dir === 'rtl' ? 'خطا' : 'Error'}
                            </h2>
                            <p className="text-slate-500 mb-8">{error}</p>
                            <button
                                onClick={startScanning}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                {t.dashboards.scan_again}
                            </button>
                        </div>
                    )}

                    {result && (
                        <div className="py-8">
                            <div className="text-center mb-8">
                                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 mb-6">
                                    <CheckCircle size={48} className="text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-black text-emerald-500">
                                    {t.dashboards.student_found}
                                </h2>
                            </div>

                            {/* Student Info Card */}
                            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl p-6 border border-border">
                                <div className="flex items-start gap-6">
                                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-primary/20 overflow-hidden">
                                        {result.image ? (
                                            <img src={result.image} alt={result.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-foreground mb-2">{result.name}</h3>
                                        <div className="space-y-2 text-sm">
                                            <p className="text-slate-500">
                                                <span className="font-bold">{t.student_registration.student_id}:</span> {result.studentId}
                                            </p>
                                            <p className="text-slate-500">
                                                <span className="font-bold">{t.student_registration.father_name_dr}:</span> {result.fatherName || '---'}
                                            </p>
                                            {result.currentClass && (
                                                <p className="text-slate-500 flex items-center gap-2">
                                                    <School size={16} />
                                                    <span className="font-bold">{t.dashboards.classes}:</span> {result.currentClass.level} - {result.currentClass.section}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-4">
                                    <Link
                                        href={`/dashboard/admin/students/${result.id}`}
                                        className="flex-1 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-center hover:bg-primary/90 transition-all"
                                    >
                                        {t.dashboards.view_profile}
                                    </Link>
                                    <button
                                        onClick={startScanning}
                                        className="flex-1 px-6 py-3 bg-slate-200 dark:bg-white/10 text-foreground rounded-2xl font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                                    >
                                        {t.dashboards.scan_again}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
