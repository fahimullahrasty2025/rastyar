"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
    BookOpen,
    FolderPlus,
    Plus,
    Trash2,
    Tag,
    Book,
    Edit,
    Save,
    X,
    ArrowLeft
} from "lucide-react";

export default function ManageSubjectsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t } = useLanguage();

    const [categories, setCategories] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [newCatName, setNewCatName] = useState("");
    const [newSubName, setNewSubName] = useState("");
    const [selectedCatId, setSelectedCatId] = useState("");

    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [editCatName, setEditCatName] = useState("");

    const [editingSubId, setEditingSubId] = useState<string | null>(null);
    const [editSubName, setEditSubName] = useState("");
    const [editSubCatId, setEditSubCatId] = useState("");

    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [catRes, subRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/subjects")
            ]);
            if (catRes.ok) setCategories(await catRes.json());
            if (subRes.ok) setSubjects(await subRes.json());
        } catch (err) {
            console.error("Fetch error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "SUPERADMIN") {
            router.push("/");
        } else if (session) {
            fetchData();
        }
    }, [status, session, router, fetchData]);

    const addCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName) return;
        const res = await fetch("/api/categories", {
            method: "POST",
            body: JSON.stringify({ name: newCatName }),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            setNewCatName("");
            fetchData();
        }
    };

    const deleteCategory = async (id: string) => {
        if (!confirm(t.dashboards.delete + "?")) return;
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
    };

    const updateCategory = async (id: string) => {
        const res = await fetch(`/api/categories/${id}`, {
            method: "PUT",
            body: JSON.stringify({ name: editCatName }),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            setEditingCatId(null);
            fetchData();
        }
    };

    const addSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubName || !selectedCatId) return;
        const res = await fetch("/api/subjects", {
            method: "POST",
            body: JSON.stringify({ name: newSubName, categoryId: selectedCatId }),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            setNewSubName("");
            fetchData();
        }
    };

    const deleteSubject = async (id: string) => {
        if (!confirm(t.dashboards.delete + "?")) return;
        const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
        if (res.ok) fetchData();
    };

    const updateSubject = async (id: string) => {
        const res = await fetch(`/api/subjects/${id}`, {
            method: "PUT",
            body: JSON.stringify({ name: editSubName, categoryId: editSubCatId }),
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            setEditingSubId(null);
            fetchData();
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-3 md:p-5 font-sans transition-colors duration-300">
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h1 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
                    <BookOpen className="text-primary" size={28} />
                    {t.dashboards.manage_subjects}
                </h1>
                <button
                    onClick={() => router.push("/dashboard/superadmin")}
                    className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted/80 transition-all"
                >
                    <ArrowLeft size={16} />
                    {t.home}
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">

                {/* Categories Section - HIDDEN */}
                {/* <div className="hidden space-y-4"> ... </div> */}

                {/* Subjects Section */}
                <div className="md:col-span-2 space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-4 md:p-5 shadow-sm h-full flex flex-col">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                            <Book className="text-emerald-500" size={20} />
                            {t.dashboards.subjects}
                        </h3>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newSubName) return;

                            // Find or create default category
                            let catId = categories.length > 0 ? categories[0].id : null;
                            if (!catId) {
                                // Create default category
                                const res = await fetch("/api/categories", {
                                    method: "POST",
                                    body: JSON.stringify({ name: "General" }),
                                    headers: { "Content-Type": "application/json" }
                                });
                                if (res.ok) {
                                    const newCat = await res.json();
                                    catId = newCat.id;
                                    // Refresh categories
                                    const catRes = await fetch("/api/categories");
                                    if (catRes.ok) setCategories(await catRes.json());
                                }
                            }

                            if (catId) {
                                const res = await fetch("/api/subjects", {
                                    method: "POST",
                                    body: JSON.stringify({ name: newSubName, categoryId: catId }),
                                    headers: { "Content-Type": "application/json" }
                                });
                                if (res.ok) {
                                    setNewSubName("");
                                    fetchData();
                                }
                            }
                        }} className="flex flex-col gap-2 mb-6">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder={t.dashboards.subject_name}
                                    value={newSubName}
                                    onChange={(e) => setNewSubName(e.target.value)}
                                    className="flex-[2] rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                />
                                {/* Category Select Hidden */}
                            </div>
                            <button type="submit" className="rounded-xl bg-emerald-500 py-2 text-white text-sm font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-md">
                                <Plus size={16} />
                                {t.dashboards.add_subject}
                            </button>
                        </form>

                        <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                            {subjects.map((sub) => (
                                <div key={sub.id} className="group flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border hover:bg-muted/40 transition-all gap-3">
                                    <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                                        <BookOpen className="text-emerald-500 opacity-50 flex-shrink-0" size={16} />
                                        {editingSubId === sub.id ? (
                                            <div className="flex flex-col w-full gap-1.5">
                                                <input
                                                    value={editSubName}
                                                    onChange={(e) => setEditSubName(e.target.value)}
                                                    className="bg-background border border-emerald-500 rounded-lg px-2 py-1 text-sm outline-none font-bold"
                                                    autoFocus
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="font-bold text-foreground text-sm leading-tight truncate">{sub.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        {editingSubId === sub.id ? (
                                            <>
                                                <button onClick={() => updateSubject(sub.id)} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all">
                                                    <Save size={14} />
                                                </button>
                                                <button onClick={() => setEditingSubId(null)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
                                                    <X size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => { setEditingSubId(sub.id); setEditSubName(sub.name); setEditSubCatId(sub.categoryId); }}
                                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500/20"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => deleteSubject(sub.id)}
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
      `}</style>
        </div>
    );
}
