"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function StudentDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
        } else if (session && (session.user as any).role !== "STUDENT") {
            router.push("/");
        }
    }, [status, session, router]);

    if (status === "loading") return <p className="p-8 text-white">Loading...</p>;

    if (!session || (session.user as any).role !== "STUDENT") return null;

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-white">
            <h1 className="mb-6 text-4xl font-bold text-blue-500">{t.dashboards.student}</h1>
            <p className="text-xl">{t.welcome}, {(session.user as any).name}!</p>
        </div>
    );
}
