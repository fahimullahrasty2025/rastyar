"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
    ArrowLeft,
    Loader2,
    Printer,
    Settings2,
    LayoutTemplate,
    Type,
    Save
} from "lucide-react";
import Link from "next/link";

const toPersianNum = (n: string | number) => {
    return String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
};

export default function GradingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [classData, setClassData] = useState<any>(null);
    const [schoolSettings, setSchoolSettings] = useState<any>(null);
    const [gradesMatrix, setGradesMatrix] = useState<Record<string, Record<string, Record<string, string>>>>({});
    const [attendanceMatrix, setAttendanceMatrix] = useState<Record<string, Record<string, any>>>({});
    const [observationMatrix, setObservationMatrix] = useState<Record<string, string>>({});

    // UI Settings
    const [margins, setMargins] = useState({ top: 0.5, right: 2, bottom: 0.5, left: 0.5 });
    const [generalFontSize, setGeneralFontSize] = useState(11);
    const [tableFontSize, setTableFontSize] = useState(11);
    const [headerSignatures, setHeaderSignatures] = useState(true);
    const [showPageNumber, setShowPageNumber] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPERADMIN" && (session.user as any).role !== "TEACHER") {
            router.push("/");
        }

        if (session && params.id) {
            fetchInitialData();
        }
    }, [status, session, router, params.id]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [classRes, gradesRes, settingsRes, attendanceRes] = await Promise.all([
                fetch(`/api/admin/classes/${params.id}`),
                fetch(`/api/grades?classId=${params.id}`),
                fetch("/api/settings"),
                fetch(`/api/attendance?classId=${params.id}`)
            ]);

            if (classRes.ok && gradesRes.ok && settingsRes.ok && attendanceRes.ok) {
                const classData = await classRes.json();
                const gradesData = await gradesRes.json();
                const settingsData = await settingsRes.json();
                const attendanceData = await attendanceRes.json();

                setClassData(classData);
                setSchoolSettings(settingsData);

                const matrix: Record<string, Record<string, Record<string, string>>> = {};
                const attMatrix: Record<string, Record<string, any>> = {};
                const obsMatrix: Record<string, string> = {};

                classData.students?.forEach((student: any) => {
                    matrix[student.id] = {};
                    attMatrix[student.id] = {
                        MIDTERM: { days: "", present: "", absent: "", sick: "", leave: "" },
                        FINAL: { days: "", present: "", absent: "", sick: "", leave: "" }
                    };
                    obsMatrix[student.id] = "";
                    classData.subjects?.forEach((subject: any) => {
                        matrix[student.id][subject.id] = { MIDTERM: "", FINAL: "" };
                    });
                });

                gradesData.forEach((g: any) => {
                    if (matrix[g.studentId] && matrix[g.studentId][g.subjectId]) {
                        matrix[g.studentId][g.subjectId][g.type] = g.score.toString();
                    }
                });

                attendanceData.forEach((a: any) => {
                    if (attMatrix[a.studentId]) {
                        attMatrix[a.studentId][a.type] = {
                            days: a.days || "",
                            present: a.present || "",
                            absent: a.absent || "",
                            sick: a.sick || "",
                            leave: a.leave || ""
                        };
                        if (a.type === "MIDTERM" && a.remarks) {
                            obsMatrix[a.studentId] = a.remarks;
                        }
                    }
                });

                setGradesMatrix(matrix);
                setAttendanceMatrix(attMatrix);
                setObservationMatrix(obsMatrix);
            } else {
                setError("Failed to load data");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (studentId: string, subjectId: string, type: string, value: string) => {
        const val = parseFloat(value);
        if (type === "MIDTERM" && val > 40) return;
        if (type === "FINAL" && val > 60) return;

        setGradesMatrix(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [subjectId]: { ...prev[studentId][subjectId], [type]: value }
            }
        }));
    };

    const handleAttendanceChange = (studentId: string, type: string, field: string, value: string) => {
        setAttendanceMatrix(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [type]: { ...prev[studentId][type], [field]: value }
            }
        }));
    };

    const handleObservationChange = (studentId: string, value: string) => {
        setObservationMatrix(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSave = async () => {
        setSubmitting(true);
        setSuccess(false);
        setError("");

        try {
            const bulkGrades: any[] = [];
            Object.entries(gradesMatrix).forEach(([studentId, subjects]) => {
                Object.entries(subjects).forEach(([subjectId, types]) => {
                    if (types.MIDTERM !== "") bulkGrades.push({ studentId, subjectId, type: "MIDTERM", score: types.MIDTERM });
                    if (types.FINAL !== "") bulkGrades.push({ studentId, subjectId, type: "FINAL", score: types.FINAL });
                });
            });

            const bulkAttendance: any[] = [];
            Object.entries(attendanceMatrix).forEach(([studentId, types]) => {
                const mid = types.MIDTERM;
                const fin = types.FINAL;
                const observation = observationMatrix[studentId] || "";

                if (Object.values(mid).some(v => v !== "") || observation !== "") {
                    bulkAttendance.push({ studentId, type: "MIDTERM", ...mid, remarks: observation });
                }
                if (Object.values(fin).some(v => v !== "")) {
                    bulkAttendance.push({ studentId, type: "FINAL", ...fin });
                }
            });

            const [resGrades, resAtt] = await Promise.all([
                fetch("/api/grades", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ classId: params.id, bulkGrades })
                }),
                fetch("/api/attendance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ classId: params.id, bulkAttendance })
                })
            ]);

            if (resGrades.ok && resAtt.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError("Failed to save data");
            }
        } catch (err) {
            setError("Error saving data");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrint = () => window.print();

    const updateMargin = (side: keyof typeof margins, val: string) => {
        const numVal = parseFloat(val) || 0;
        setMargins(prev => ({ ...prev, [side]: numVal }));
    };

    const subjects = useMemo(() => classData?.subjects || [], [classData]);
    const students = useMemo(() => {
        const list = [...(classData?.students || [])];
        const FIXED_STUDENT_COUNT = 7;
        while (list.length < FIXED_STUDENT_COUNT) {
            list.push({ id: `empty-${list.length}`, name: "", fatherName: "", grandfatherName: "", studentId: "", tazkiraNo: "", isEmpty: true });
        }
        return list;
    }, [classData]);

    const studentResults = useMemo(() => {
        const results: Record<string, { total: number, avg: number, fails: number, result: string, rank: number, midTotal: number, finalTotal: number }> = {};
        const validStudents = students.filter(s => !s.isEmpty);

        validStudents.forEach(s => {
            let totalVal = 0;
            let midTotalCount = 0;
            let finalTotalCount = 0;
            let fails = 0;
            let hasAnyData = false;

            subjects.forEach((sub: any) => {
                const midStr = gradesMatrix[s.id]?.[sub.id]?.MIDTERM;
                const finStr = gradesMatrix[s.id]?.[sub.id]?.FINAL;
                const mid = midStr !== "" && midStr !== undefined ? parseFloat(midStr) : -1;
                const fin = finStr !== "" && finStr !== undefined ? parseFloat(finStr) : -1;

                if (mid !== -1 || fin !== -1) hasAnyData = true;

                const mVal = mid === -1 ? 0 : mid;
                const fVal = fin === -1 ? 0 : fin;

                midTotalCount += mVal;
                finalTotalCount += fVal;
                totalVal += (mVal + fVal);

                if (mid !== -1 && fin !== -1 && (mVal + fVal) < 40) fails++;
            });

            const avg = totalVal / Math.max(1, subjects.length);
            let resStatus = "";
            if (hasAnyData) {
                if (fails === 0 && avg >= 40) resStatus = "کامیاب";
                else if ((fails === 1 || fails === 2) && avg >= 40) resStatus = "مشروط";
                else if (avg < 40 || fails >= 3) resStatus = "ناکام";
                else resStatus = "در جریان";
            }
            results[s.id] = { total: totalVal, avg, fails, result: resStatus, rank: 0, midTotal: midTotalCount, finalTotal: finalTotalCount };
        });

        const ranked = validStudents
            .filter(s => results[s.id]?.result === "کامیاب")
            .sort((a, b) => (results[b.id]?.total || 0) - (results[a.id]?.total || 0));

        ranked.forEach((s, idx) => {
            if (results[s.id]) results[s.id].rank = idx + 1;
        });
        return results;
    }, [students, subjects, gradesMatrix]);

    const khalasMidterm = useMemo(() => {
        const valid = students.filter(s => !s.isEmpty);
        const tested = valid.filter(s => subjects.some((sub: any) => (gradesMatrix[s.id]?.[sub.id]?.MIDTERM || "") !== ""));
        const passed = valid.filter(s => {
            const r = studentResults[s.id];
            return r && (r.midTotal / Math.max(1, subjects.length)) >= 20;
        });
        return { total: valid.length, tested: tested.length, passed: passed.length, failed: tested.length - passed.length, absent: valid.length - tested.length };
    }, [students, subjects, gradesMatrix, studentResults]);

    const khalasAnnual = useMemo(() => {
        const valid = students.filter(s => !s.isEmpty);
        const passed = valid.filter(s => studentResults[s.id]?.result === "کامیاب");
        const mashrut = valid.filter(s => studentResults[s.id]?.result === "مشروط");
        const nakam = valid.filter(s => studentResults[s.id]?.result === "ناکام");
        const tested = valid.filter(s => subjects.some((sub: any) => (gradesMatrix[s.id]?.[sub.id]?.FINAL || "") !== ""));
        return { total: valid.length, tested: tested.length, passed: passed.length, mashrut: mashrut.length, nakam: nakam.length, absent: valid.length - tested.length };
    }, [students, subjects, gradesMatrix, studentResults]);

    const observationRowSpan = 5 + 1 + subjects.length + 4 + 5;

    if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    if (!classData) return <div className="p-20 text-center font-bold">Class not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 text-black overflow-x-auto">
            <style jsx global>{`
                @media print {
                    @page { size: A4 landscape; margin: 0; }
                    body { background: white !important; margin: 0 !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .a4-landscape { 
                        margin: 0 !important; 
                        box-shadow: none !important; 
                        border: none !important;
                        width: 100% !important;
                        height: 100% !important;
                        padding: var(--margin-top) var(--margin-right) var(--margin-bottom) var(--margin-left) !important;
                    }
                    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #000 !important; border-color: #000 !important; }
                }
                .a4-landscape {
                    width: 297mm;
                    min-height: 210mm;
                    padding: var(--margin-top) var(--margin-right) var(--margin-bottom) var(--margin-left);
                    background: white;
                    margin: 10mm auto;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    position: relative;
                    direction: rtl;
                }
                .grading-table { border-collapse: collapse; width: 100%; border: 1.5px solid #000; table-layout: fixed; }
                .grading-table td, .grading-table th { border: 1px solid #000; text-align: center; height: 22px; }
                .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; text-align: center; }
                .grade-input { width: 100%; height: 24px; border: none; text-align: center; font-weight: bold; outline: none; background: transparent; }
                .grade-input::-webkit-inner-spin-button { display: none; }
                .text-right-important { text-align: right !important; padding-right: 4px !important; }
                .observation-cell { vertical-align: top !important; text-align: right !important; padding: 2px !important; line-height: 1.1; position: relative; }
                .observation-textarea { 
                    width: 100%; 
                    height: 100%; 
                    border: none; 
                    resize: none; 
                    font-size: 8px; 
                    background: transparent; 
                    outline: none; 
                    writing-mode: vertical-rl; 
                    text-align: right;
                    font-family: inherit;
                    overflow: hidden;
                    padding-top: 5px;
                }
            `}</style>

            <div className="no-print bg-white p-6 rounded-3xl shadow-xl mb-8 w-[297mm] flex flex-col gap-6 border border-slate-200">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-4 text-start">
                        <Link href={`/dashboard/admin/classes/${params.id}`} className="bg-slate-100 p-3 rounded-2xl hover:bg-slate-200 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex flex-col text-right">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">سیستم مدیریت نتایج نهایی</h1>
                            <span className="text-sm font-medium text-slate-500">{schoolSettings?.schoolName || "لیسه عالی خصوصی نیکان"}</span>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                            <Type size={16} className="text-slate-500" />
                            <label className="text-xs font-bold text-slate-700">خط عمومی:</label>
                            <input type="number" value={generalFontSize} onChange={(e) => setGeneralFontSize(parseInt(e.target.value) || 11)} className="w-10 bg-transparent border-none text-center font-bold" />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                            <Settings2 size={16} className="text-slate-500" />
                            <label className="text-xs font-bold text-slate-700">خط جدول:</label>
                            <input type="number" value={tableFontSize} onChange={(e) => setTableFontSize(parseInt(e.target.value) || 11)} className="w-10 bg-transparent border-none text-center font-bold" />
                        </div>
                        <button onClick={() => setHeaderSignatures(!headerSignatures)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm">
                            <LayoutTemplate size={18} />
                            {headerSignatures ? "امضاها پایین" : "امضاها بالا"}
                        </button>
                        <button onClick={() => setShowPageNumber(!showPageNumber)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all ${showPageNumber ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                            {showPageNumber ? "نمایش صفحه: بله" : "نمایش صفحه: خیر"}
                        </button>
                        <button onClick={handleSave} disabled={submitting} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg ${success ? 'bg-emerald-500' : 'bg-orange-500 hover:bg-orange-600'}`}>
                            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            ذخیره نمرات
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white px-8 py-2.5 rounded-xl transition-all shadow-lg font-bold">
                            <Printer size={20} />
                            چاپ نهایی
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <Settings2 size={18} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">تنظیم حاشیه کاغذ (cm):</span>
                    </div>
                    <div className="flex gap-6 flex-1 justify-center">
                        {Object.entries(margins).map(([side, value]) => (
                            <div key={side} className="flex items-center gap-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">{side === 'top' ? 'بالا' : side === 'right' ? 'راست' : side === 'bottom' ? 'پایین' : 'چپ'}</label>
                                <input type="number" step="0.1" value={value} onChange={(e) => updateMargin(side as any, e.target.value)} className="w-14 border rounded p-1 text-center text-xs font-bold" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="a4-landscape" style={{
                '--margin-top': `${margins.top}cm`,
                '--margin-right': `${margins.right}cm`,
                '--margin-bottom': `${margins.bottom}cm`,
                '--margin-left': `${margins.left}cm`,
                fontSize: `${generalFontSize}px`
            } as any}>

                <div className="flex justify-between items-start mb-2">
                    <div className="w-52 text-right font-bold flex flex-col gap-1 text-black">
                        {showPageNumber && <div>شماره صفحه: {toPersianNum(1)}</div>}
                        {headerSignatures && (
                            <div className="mt-2 flex flex-col gap-2">
                                <div>امضاء نگران: ..........................</div>
                                <div className="text-nowrap">امضاء سرمعلم: ..........................</div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col w-32 items-center flex-1 text-black">
                        <div className="flex items-center gap-6 mb-1">
                            <img src={schoolSettings?.logoRight || "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Emblem_of_Afghanistan.svg/1024px-Emblem_of_Afghanistan.svg.png"} className="h-16 w-auto grayscale" />
                            <div className="flex flex-col text-center">
                                <span className="font-extrabold text-lg">{schoolSettings?.headerTitle1 || "وزارت معارف"}</span>
                                <span className="font-bold text-sm">{schoolSettings?.headerTitle2 || "ریاست معارف ولایت کابل"}</span>
                                <span className="font-bold text-[10px]">{schoolSettings?.headerTitle3 || "آمریت معارف حوزه دوازدهم تعلیمی"}</span>
                                <span className="font-black text-sm mt-1 border-b-2 border-black pb-1">{schoolSettings?.schoolName || "لیسه عالی خصوصی نیکان"}</span>
                                <div className="text-[10px] font-bold mt-1 flex gap-2 justify-center">
                                    <span>سال تعلیمی: {toPersianNum(1404)} هـ ش</span>
                                    <span>مطابق: {toPersianNum(1447)} هـ ق</span>
                                </div>
                            </div>
                            <img src={schoolSettings?.logoLeft || "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Emblem_of_Afghanistan.svg/1024px-Emblem_of_Afghanistan.svg.png"} className="h-16 w-auto grayscale" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <table className="w-[150px] grading-table text-[10px]">
                            <thead><tr><th colSpan={2} className="bg-gray-200 py-1 border border-black font-bold h-7">خلص نتايج چهارونیم ماهه</th></tr></thead>
                            <tbody>
                                <tr className="h-6"><td className="text-right-important px-2">تعداد داخله</td><td className="w-8">{toPersianNum(khalasMidterm.total)}</td></tr>
                                <tr className="h-6"><td className="text-right-important px-2">شامل امتحان</td><td>{toPersianNum(khalasMidterm.tested)}</td></tr>
                                <tr className="h-6"><td className="text-right-important px-2 font-bold">موفق</td><td>{toPersianNum(khalasMidterm.passed)}</td></tr>
                                <tr className="h-6"><td className="text-right-important px-2">ناکام</td><td>{toPersianNum(khalasMidterm.failed)}</td></tr>
                                <tr className="h-6"><td className="text-right-important px-2">غایب</td><td>{toPersianNum(khalasMidterm.absent)}</td></tr>
                            </tbody>
                        </table>
                        <table className="w-[150px] grading-table text-[10px]">
                            <thead><tr><th colSpan={2} className="bg-gray-200 py-1 border border-black font-bold h-7">خلص نتایج سالانه</th></tr></thead>
                            <tbody>
                                <tr className="h-6"><td className="text-right-important px-2">تعداد داخله</td><td className="w-8">{toPersianNum(khalasAnnual.total)}</td></tr>
                                <tr className="h-6"><td className="text-right-important px-2">شامل امتحان</td><td>{toPersianNum(khalasAnnual.tested)}</td></tr>
                                <tr className="h-6"><td className="text-right-important px-2 font-bold">موفق</td><td>{toPersianNum(khalasAnnual.passed)}</td></tr>
                                <tr className="h-6"><td className="text-right-important px-2">مشروط</td><td>{toPersianNum(khalasAnnual.mashrut)}</td></tr>
                                <tr className="h-6"><td className="text-right-important px-2">ناکام</td><td>{toPersianNum(khalasAnnual.nakam)}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-10 border border-black bg-white text-black mb-1 font-bold text-sm">
                    <div className="col-span-2 border-l border-black p-1 text-center font-black">صنف: {toPersianNum(classData.level)}</div>
                    <div className="col-span-3 border-l border-black p-1 text-center">نگران صنف: {classData.teacher?.name || "-"}</div>
                    <div className="col-span-5 p-1 text-center font-black bg-gray-200 uppercase tracking-widest text-lg">جدول نتایج نهایی شاگردان</div>
                </div>

                <table className="grading-table text-black" style={{ fontSize: `${tableFontSize}px` }}>
                    <colgroup>
                        <col className="w-[24px]" />
                        <col className="w-[110px]" />
                        {students.map(s => (
                            <React.Fragment key={s.id}>
                                <col className="w-[28px]" />
                                <col className="w-[28px]" />
                                <col className="w-[28px]" />
                                <col className="w-[24px]" />
                            </React.Fragment>
                        ))}
                    </colgroup>
                    <tbody>
                        <tr className="bg-gray-50">
                            <td rowSpan={6} className="bg-gray-300 vertical-text font-black text-xs">شهرت شاگرد</td>
                            <td className="text-right-important font-bold pr-2 h-7">ردیف</td>
                            {students.map((s, i) => <td key={s.id} colSpan={4} className="font-bold">{toPersianNum(i + 1)}</td>)}
                        </tr>
                        <tr>
                            <td className="text-right-important font-black pr-2">اسم شاگرد</td>
                            {students.map(s => (
                                <React.Fragment key={s.id}>
                                    <td colSpan={3} className="font-black h-7 text-sm">{s.name || "---"}</td>
                                    <td rowSpan={observationRowSpan} className="observation-cell bg-white">
                                        <textarea
                                            className="observation-textarea"
                                            placeholder="ملاحظات..."
                                            value={observationMatrix[s.id] || ""}
                                            onChange={(e) => handleObservationChange(s.id, e.target.value)}
                                        />
                                    </td>
                                </React.Fragment>
                            ))}
                        </tr>
                        <tr><td className="text-right-important font-bold pr-2">نام پدر</td>{students.map(s => <td key={s.id} colSpan={3} className="h-7">{s.fatherName || "---"}</td>)}</tr>
                        <tr><td className="text-right-important font-bold pr-2 text-[10px]">نام پدرکلان</td>{students.map(s => <td key={s.id} colSpan={3} className="h-7">{s.grandfatherName || "---"}</td>)}</tr>
                        <tr><td className="text-right-important font-bold pr-2 text-[10px]">نمبر اساس</td>{students.map(s => <td key={s.id} colSpan={3} className="h-7">{s.studentId ? toPersianNum(s.studentId) : "---"}</td>)}</tr>
                        <tr><td className="text-right-important font-bold pr-2 text-[10px]">نمبر تذکره</td>{students.map(s => <td key={s.id} colSpan={3} className="h-7">{s.tazkiraNo ? toPersianNum(s.tazkiraNo) : "---"}</td>)}</tr>

                        <tr className="bg-gray-100 font-bold h-16">
                            <td colSpan={2} className="bg-gray-200 font-black text-xs">( امتحانات )</td>
                            {students.map(s => (
                                <React.Fragment key={s.id}>
                                    <td className="vertical-text text-[10px] py-1 font-black">چهارونیم ماهه</td>
                                    <td className="vertical-text text-[10px] py-1 font-black">امتحان سالانه</td>
                                    <td className="vertical-text text-[10px] py-1 bg-gray-200 font-black">مجموع نهایی</td>
                                </React.Fragment>
                            ))}
                        </tr>

                        {subjects.map((sub: any, idx) => (
                            <tr key={sub.id} className="hover:bg-slate-50">
                                {idx === 0 && <td rowSpan={subjects.length} className="bg-gray-300 vertical-text font-black text-[10px]">نمرات مضامین</td>}
                                <td className="text-right-important font-black pr-2 text-[10px] bg-slate-50/20">{sub.name}</td>
                                {students.map(s => {
                                    if (s.isEmpty) return <React.Fragment key={s.id}><td className="bg-white"></td><td className="bg-white"></td><td className="bg-white"></td></React.Fragment>;
                                    const mid = gradesMatrix[s.id]?.[sub.id]?.MIDTERM || "";
                                    const fin = gradesMatrix[s.id]?.[sub.id]?.FINAL || "";
                                    const tot = (parseFloat(mid) || 0) + (parseFloat(fin) || 0);
                                    return (
                                        <React.Fragment key={s.id}>
                                            <td className="p-0"><input type="number" className="grade-input" value={mid} onChange={(e) => handleGradeChange(s.id, sub.id, "MIDTERM", e.target.value)} /></td>
                                            <td className="p-0"><input type="number" className="grade-input" value={fin} onChange={(e) => handleGradeChange(s.id, sub.id, "FINAL", e.target.value)} /></td>
                                            <td className="bg-gray-100 font-black">{(mid !== "" || fin !== "") ? toPersianNum(tot) : ""}</td>
                                        </React.Fragment>
                                    );
                                })}
                            </tr>
                        ))}

                        <tr className="bg-gray-100 font-bold">
                            <td rowSpan={4} className="bg-gray-300 vertical-text text-[10px]">نتيجه نهايي</td>
                            <td className="text-right-important text-[10px] pr-2 bg-gray-200">مجموعه نمرات</td>
                            {students.map(s => {
                                if (s.isEmpty) return <React.Fragment key={s.id}><td></td><td></td><td></td></React.Fragment>;
                                const res = studentResults[s.id];
                                return (
                                    <React.Fragment key={s.id}>
                                        <td className="bg-gray-50">{res.result ? toPersianNum(res.midTotal) : ""}</td>
                                        <td className="bg-gray-50">{res.result ? toPersianNum(res.finalTotal) : ""}</td>
                                        <td className="bg-gray-200">{res.result ? toPersianNum(res.total) : ""}</td>
                                    </React.Fragment>
                                );
                            })}
                        </tr>
                        <tr>
                            <td className="text-right-important text-[10px] pr-2">اوسط (Average)</td>
                            {students.map(s => {
                                if (s.isEmpty) return <React.Fragment key={s.id}><td></td><td></td><td></td></React.Fragment>;
                                const res = studentResults[s.id];
                                return <React.Fragment key={s.id}><td>{res.result ? "-" : ""}</td><td colSpan={2} className="bg-gray-50 font-bold">{res.result ? toPersianNum(res.avg.toFixed(1)) : ""}</td></React.Fragment>;
                            })}
                        </tr>
                        <tr>
                            <td className="text-right-important text-[10px] pr-2">نتیجه ارتقاء</td>
                            {students.map(s => {
                                if (s.isEmpty) return <React.Fragment key={s.id}><td></td><td></td><td></td></React.Fragment>;
                                const res = studentResults[s.id];
                                return <React.Fragment key={s.id}><td>{res.result ? "موفق" : ""}</td><td colSpan={2} className="bg-gray-50 font-black text-[10px]">{res.result || ""}</td></React.Fragment>;
                            })}
                        </tr>
                        <tr>
                            <td className="text-right-important text-[10px] pr-2">درجه صنف</td>
                            {students.map(s => {
                                if (s.isEmpty) return <React.Fragment key={s.id}><td></td><td></td><td></td></React.Fragment>;
                                const res = studentResults[s.id];
                                return <React.Fragment key={s.id}><td>{res.rank ? toPersianNum(res.rank) : ""}</td><td colSpan={2} className="bg-gray-50 font-bold">{res.rank ? toPersianNum(res.rank) : ""}</td></React.Fragment>;
                            })}
                        </tr>

                        {["ایام درسی", "حاضر", "غیرحاضر", "مریض", "رخصت"].map((label, idx) => (
                            <tr key={label}>
                                {idx === 0 && <td rowSpan={5} className="bg-gray-300 vertical-text text-[10px]">حاضری</td>}
                                <td className="text-right-important text-[10px] pr-2">{label}</td>
                                {students.map(s => {
                                    if (s.isEmpty) return <React.Fragment key={s.id}><td></td><td></td><td></td></React.Fragment>;
                                    const fieldMap = ["days", "present", "absent", "sick", "leave"];
                                    const field = fieldMap[idx];
                                    const mid = attendanceMatrix[s.id]?.MIDTERM[field] || "";
                                    const fin = attendanceMatrix[s.id]?.FINAL[field] || "";
                                    const tot = (parseInt(mid) || 0) + (parseInt(fin) || 0);
                                    return (
                                        <React.Fragment key={s.id}>
                                            <td className="p-0"><input type="number" className="grade-input" value={mid} onChange={(e) => handleAttendanceChange(s.id, "MIDTERM", field, e.target.value)} /></td>
                                            <td className="p-0"><input type="number" className="grade-input" value={fin} onChange={(e) => handleAttendanceChange(s.id, "FINAL", field, e.target.value)} /></td>
                                            <td className="font-bold bg-gray-50">{(mid !== "" || fin !== "") ? toPersianNum(tot) : ""}</td>
                                        </React.Fragment>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={`grid ${headerSignatures ? "grid-cols-4" : "grid-cols-6"} mt-8 text-center font-bold px-4 text-black`} style={{ fontSize: `${generalFontSize + 1}px` }}>
                    {!headerSignatures ? (
                        <>
                            <div className="flex flex-col items-center"><span className="mb-8 font-bold">{schoolSettings?.signatureLabel2 || "امضاء نگران صنف"}</span><div className="w-28 border-t border-dashed border-black"></div></div>
                            <div className="flex flex-col items-center"><span className="mb-8 font-bold">{schoolSettings?.signatureLabel3 || "امضاء سرمعلم"}</span><div className="w-28 border-t border-dashed border-black"></div></div>
                            <div className="flex flex-col items-center"><span className="mb-8 font-bold text-nowrap">{schoolSettings?.signatureLabel1 || "مهر و امضاء مدیر لیسه"}</span><div className="w-28 border-t border-dashed border-black"></div></div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center"><span className="mb-8 font-bold text-nowrap">{schoolSettings?.signatureLabel1 || "مهر و امضاء مدیر لیسه"}</span><div className="w-28 border-t border-dashed border-black"></div></div>
                    )}
                    <div className="flex flex-col items-center"><span className="mb-8 font-bold">هیئت ممتحن</span><div className="w-28 border-t border-dashed border-black"></div></div>
                    <div className="flex flex-col items-center"><span className="mb-8 font-bold">هیئت ممتحن</span><div className="w-28 border-t border-dashed border-black"></div></div>
                    <div className="flex flex-col items-center"><span className="mb-8 font-bold text-nowrap">{schoolSettings?.signatureLabel6 || "آمریت حوزه تعلیمی"}</span><div className="w-28 border-t border-dashed border-black"></div></div>
                </div>
            </div>

            <footer className="no-print mt-8 text-slate-400 text-xs pb-10 font-medium text-center">
                {schoolSettings?.schoolName || "لیسه عالی خصوصی نیکان"} - سیستم مدیریت دیجیتال نتایج
            </footer>
        </div>
    );
}
