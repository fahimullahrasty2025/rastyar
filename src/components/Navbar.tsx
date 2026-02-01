"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSession, signOut } from "next-auth/react";
import { Language } from "@/lib/dictionary";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, LogOut, LayoutDashboard, Globe, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
    const { t, language, setLanguage } = useLanguage();
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const isDashboard = pathname.startsWith("/dashboard");

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
    };

    const dashboardLink = session
        ? `/dashboard/${(session.user as any).role?.toLowerCase()}`
        : "/";

    return (
        <nav className={`sticky top-0 z-[100] no-print transition-all duration-500 ${isDashboard
            ? "bg-transparent border-none py-4"
            : "bg-white/70 dark:bg-[#07070a]/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-white/5 py-3 shadow-2xl shadow-black/10"
            }`}>
            <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-4">

                {/* Brand / Logo */}
                <Link href="/" className="group flex items-center gap-2 relative">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                    <div className="relative flex items-center justify-center h-10 w-10 bg-black rounded-xl border border-white/10 shadow-lg shadow-cyan-500/20 overflow-hidden">
                        <img src="/images/logo.png" alt="Maktab Yar" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="hidden sm:block text-xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent px-1">
                        {t.app_name}
                    </span>
                </Link>

                {/* Main Navigation Controls */}
                <div className="flex items-center gap-2 md:gap-4 bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/10 p-1.5 rounded-[1.5rem] shadow-xl">

                    {/* Role-based Links */}
                    <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
                        <Link
                            href={dashboardLink}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${pathname.includes("/dashboard")
                                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                                : "text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                }`}
                        >
                            <LayoutDashboard size={18} />
                            <span className="hidden md:inline">{session ? t.dashboard : t.home}</span>
                        </Link>

                        {!session && (
                            <Link
                                href="/auth/signin"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                            >
                                {t.login}
                            </Link>
                        )}
                    </div>

                    {/* Theme Switcher (Modernized) */}
                    <div className="flex items-center p-1 bg-black/40 rounded-xl gap-1">
                        {[
                            { val: 'light', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                            { val: 'dark', icon: Moon, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                            { val: 'system', icon: Monitor, color: 'text-slate-400', bg: 'bg-slate-400/10' }
                        ].map((item) => (
                            <button
                                key={item.val}
                                onClick={() => setTheme(item.val)}
                                className={`p-2 rounded-lg transition-all duration-300 relative group ${theme === item.val
                                    ? `text-white ${item.bg} ring-1 ring-white/10`
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <item.icon size={16} className={theme === item.val ? "animate-pulse" : ""} />
                            </button>
                        ))}
                    </div>

                    {/* Language Switcher (Floating List Style) */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-xl border border-white/5 text-slate-300 hover:text-white transition-all text-sm font-bold">
                            <Globe size={16} className="text-cyan-500" />
                            <span className="uppercase">{language}</span>
                        </button>
                        <div className="absolute top-full right-0 mt-3 p-2 bg-[#07070a]/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 min-w-[120px] z-50">
                            {[
                                { val: "fa", label: "دری" },
                                { val: "ps", label: "پښتو" },
                                { val: "en", label: "EN" }
                            ].map((lang) => (
                                <button
                                    key={lang.val}
                                    onClick={() => handleLanguageChange(lang.val as Language)}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${language === lang.val
                                        ? "bg-cyan-500/20 text-cyan-400"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    {lang.label}
                                    {language === lang.val && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User Action (Logout) */}
                    {session && (
                        <button
                            onClick={() => signOut()}
                            className="flex items-center justify-center p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20 group"
                        >
                            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
