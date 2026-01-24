"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { ArrowRight, School, ShieldCheck, Users, BookOpen, LineChart, MessageCircle, Wallet } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session) {
      router.push(`/dashboard/${(session.user as any).role?.toLowerCase()}`);
    }
  }, [session, router]);

  if (!mounted) return null;

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px] animate-pulse delay-1000 pointer-events-none"></div>
      <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-blue-500/5 blur-[100px] animate-pulse pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-black tracking-widest uppercase text-primary animate-pulse">
          {t.welcome}
        </div>
        <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50">
          {t.app_name}
        </h1>
        <p className="mt-8 max-w-2xl text-xl text-muted-foreground leading-relaxed">
          {t.home_page.description}
        </p>

        {!session && (
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth/signin"
              className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-primary/90 hover:scale-105"
            >
              {t.login} <ArrowRight size={20} />
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full border border-border bg-card px-8 py-4 text-lg font-bold text-foreground transition hover:bg-muted"
            >
              {t.register}
            </Link>
          </div>
        )}

        {/* Feature Section */}
        <div className="mt-32 grid grid-cols-1 gap-8 md:grid-cols-3 w-full max-w-6xl">
          {[
            { icon: ShieldCheck, title: t.home_page.feature_superadmin_title, desc: t.home_page.feature_superadmin_desc },
            { icon: School, title: t.home_page.feature_admin_title, desc: t.home_page.feature_admin_desc },
            { icon: Users, title: t.home_page.feature_collab_title, desc: t.home_page.feature_collab_desc }
          ].map((f, i) => (
            <div key={i} className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 text-left hover:shadow-2xl hover:border-primary/50 transition-all group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all"></div>
              <div className="mb-4 inline-block rounded-2xl bg-primary/10 p-4 text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-3">
                <f.icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{f.title}</h3>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Us Section */}
      <div className="mt-32 w-full max-w-6xl px-4 mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-card/30 border border-white/10 backdrop-blur-md p-8 md:p-12">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-700"></div>

          <div className="relative z-10 grid gap-12 md:grid-cols-2 items-center">
            <div className="text-right rtl:text-right ltr:text-left">
              <h2 className="text-3xl font-black mb-6 text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                {(t.home_page as any).about_us_title}
              </h2>
              <p className="text-lg text-muted-foreground leading-loose">
                {(t.home_page as any).about_us_desc}
              </p>
            </div>
            <div className="relative h-64 w-full rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/5 flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
              <School className="w-32 h-32 text-primary/50 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="mt-32 w-full max-w-6xl px-4 pb-20 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 tracking-tight">{(t.home_page as any).services_title}</h2>
          <p className="text-xl text-muted-foreground">{(t.home_page as any).services_desc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Users, title: (t.home_page as any).service_1, desc: (t.home_page as any).service_1_desc, color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: BookOpen, title: (t.home_page as any).service_2, desc: (t.home_page as any).service_2_desc, color: "text-green-500", bg: "bg-green-500/10" },
            { icon: Wallet, title: (t.home_page as any).service_3, desc: (t.home_page as any).service_3_desc, color: "text-orange-500", bg: "bg-orange-500/10" },
            { icon: MessageCircle, title: (t.home_page as any).service_4, desc: (t.home_page as any).service_4_desc, color: "text-purple-500", bg: "bg-purple-500/10" }
          ].map((service, i) => (
            <div key={i} className="group relative rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 hover:bg-card/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className={`mb-4 inline-flex rounded-xl p-3 ${service.bg} ${service.color}`}>
                <service.icon size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
}
