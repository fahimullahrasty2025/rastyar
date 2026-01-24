"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function TeacherDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
        } else if (session && (session.user as any).role !== "TEACHER") {
            router.push("/");
        }
    }, [status, session, router]);

    if (status === "loading") return <p className="p-8 text-white">Loading...</p>;

    if (!session || (session.user as any).role !== "TEACHER") return null;

    return (
        <div className="p-8">
            <h1 className="mb-6 text-4xl font-bold text-green-500">{t.dashboards.teacher}</h1>
            <p className="text-xl">{t.welcome}, {(session.user as any).name}!</p>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-card border border-border p-6 shadow-md">
                    <h3 className="text-2xl font-bold mb-2">{t.dashboards.request_promotion}</h3>
                    <p className="text-slate-500">{t.dashboards.contact_superadmin}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-6 shadow-md">
                    <h3 className="text-2xl font-bold mb-2">{t.dashboards.manage_students}</h3>
                    <p className="text-slate-500">Create accounts for your students.</p>
                </div>
            </div>
        </div>
    );
}
