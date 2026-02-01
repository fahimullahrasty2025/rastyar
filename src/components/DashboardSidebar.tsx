"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
    LayoutDashboard,
    Users,
    School,
    GraduationCap,
    QrCode,
    CreditCard,
    Bell,
    Settings,
    LogOut
} from "lucide-react";

export default function DashboardSidebar({ role }: { role: string }) {
    const pathname = usePathname();
    const { dir } = useLanguage();

    const navItems = [
        { icon: LayoutDashboard, href: `/dashboard/${role}`, active: pathname === `/dashboard/${role}` },
        {
            icon: Users,
            href: role === 'teacher' ? `/dashboard/teacher/students/new` : (role === 'superadmin' ? `/dashboard/superadmin` : `/dashboard/admin`),
            active: pathname.includes('/students') || (role === 'teacher' && pathname.includes('/students/new')),
            label: role === 'superadmin' ? "Users" : "Students"
        },
        ...(role === 'teacher' ? [
            {
                icon: GraduationCap,
                href: `/dashboard/teacher/classes`,
                active: pathname.includes(`/classes`),
                label: "My Classes"
            },
            {
                icon: Users,
                href: `/dashboard/teacher/parents/new`,
                active: pathname === `/dashboard/teacher/parents/new`,
                label: "Parents"
            },
            {
                icon: Settings,
                href: `/dashboard/teacher/profile`,
                active: pathname === `/dashboard/teacher/profile`,
                label: "Profile"
            }
        ] : [
            {
                icon: School,
                href: role === 'superadmin' ? `/dashboard/superadmin/classes` : `/dashboard/admin/classes`,
                active: pathname.includes(`/classes`)
            },
            { icon: QrCode, href: "/scan-qr", active: pathname === "/scan-qr" },
            { icon: CreditCard, href: "#", active: false },
            { icon: Bell, href: "#", active: false },
            { icon: Settings, href: role === 'superadmin' ? `/dashboard/superadmin/settings` : `/dashboard/admin/settings`, active: pathname.includes('/settings') },
        ]),
    ];

    // Mobile Bottom Navigation Items (subset for better fit)
    const mobileNavItems = role === 'teacher'
        ? [navItems[0], navItems[1], navItems[3], navItems[4]]
        : navItems.filter((_, i) => [0, 2, 3, 6].includes(i));

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`fixed ${dir === 'rtl' ? 'right-6' : 'left-6'} no-print top-24 bottom-6 w-20 hidden lg:flex flex-col items-center py-8 bg-card/60 backdrop-blur-3xl border border-border rounded-[2.5rem] z-40 shadow-xl dark:shadow-2xl transition-all duration-500`}>
                <div className="mb-6 p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg overflow-hidden h-12 w-12 flex items-center justify-center flex-shrink-0">
                    <img src="/images/logo.png" alt="Logo" className="h-full w-full object-cover" />
                </div>
                <nav className="flex flex-col gap-5 flex-1 overflow-y-auto overflow-x-hidden w-full px-2" style={{ scrollbarWidth: 'thin' }}>
                    {navItems.map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className={`p-4 rounded-2xl transition-all duration-300 group hover:scale-110 flex items-center justify-center flex-shrink-0 ${item.active ? 'text-white bg-cyan-600 dark:bg-cyan-500 shadow-lg shadow-cyan-500/30' : 'text-slate-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-white hover:bg-cyan-500/5'}`}
                        >
                            <item.icon size={24} />
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile Bottom Navigation Bar */}
            <div className="lg:hidden fixed bottom-6 no-print left-6 right-6 h-16 bg-card/80 backdrop-blur-2xl border border-border rounded-[2rem] z-[90] shadow-2xl flex items-center justify-around px-2 py-2">
                {mobileNavItems.map((item, i) => (
                    <Link
                        key={i}
                        href={item.href}
                        className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${item.active ? 'text-white bg-cyan-600 dark:bg-cyan-500 shadow-lg shadow-cyan-500/30' : 'text-slate-400 hover:text-cyan-600 hover:bg-cyan-500/5'}`}
                    >
                        <item.icon size={22} />
                    </Link>
                ))}
            </div>
        </>
    );
}
