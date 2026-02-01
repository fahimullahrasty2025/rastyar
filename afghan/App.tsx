
import React, { useState } from 'react';
import { MOCK_STUDENTS, SUBJECTS } from './constants';
import { Printer, Settings2, LayoutTemplate, Type } from 'lucide-react';

const toPersianNum = (n: string | number) => {
  return String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
};

const App: React.FC = () => {
  const [students] = useState(MOCK_STUDENTS);
  // حاشیه راست پیش‌فرض به ۲ تغییر یافت
  const [margins, setMargins] = useState({ top: 0.5, right: 2, bottom: 0.5, left: 0.5 });
  // فونت‌های پیش‌فرض به ۱۱ تغییر یافتند
  const [generalFontSize, setGeneralFontSize] = useState(11);
  const [tableFontSize, setTableFontSize] = useState(11);
  const [headerSignatures, setHeaderSignatures] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const updateMargin = (side: keyof typeof margins, val: string) => {
    const numVal = parseFloat(val) || 0;
    setMargins(prev => ({ ...prev, [side]: numVal }));
  };

  // ردیف‌ها: ۶ هویت + ۱ هدر امتحانات + ۱۳ مضامین + ۴ نتیجه + ۵ حاضری = ۲۹ ردیف کل
  // سلول ملاحظات از ردیف دوم (اسم شاگرد) شروع می‌شود، پس ۲۸ ردیف باقی‌مانده را پوشش می‌دهد
  const observationRowSpan = 5 + 1 + SUBJECTS.length + 4 + 5;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 text-black">
      {/* Modern Control Panel */}
      <div className="no-print bg-white p-6 rounded-2xl shadow-xl mb-8 w-[297mm] flex flex-col gap-6 border border-slate-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-black p-3 rounded-xl">
              <LayoutTemplate className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">سیستم مدیریت نتایج نهایی</h1>
              <span className="text-sm font-medium text-slate-500">لیسه عالی خصوصی نیکان</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {/* General Font Size Control */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
               <Type size={16} className="text-slate-500" />
               <label className="text-xs font-bold text-slate-700">خط عمومی:</label>
               <input 
                 type="number" 
                 value={generalFontSize} 
                 onChange={(e) => setGeneralFontSize(parseInt(e.target.value) || 11)}
                 className="w-10 bg-transparent border-none text-center font-bold text-slate-900 focus:ring-0"
               />
            </div>

            {/* Table Font Size Control */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
               <Settings2 size={16} className="text-slate-500" />
               <label className="text-xs font-bold text-slate-700">خط جدول:</label>
               <input 
                 type="number" 
                 value={tableFontSize} 
                 onChange={(e) => setTableFontSize(parseInt(e.target.value) || 11)}
                 className="w-10 bg-transparent border-none text-center font-bold text-slate-900 focus:ring-0"
               />
            </div>

            <button 
              onClick={() => setHeaderSignatures(!headerSignatures)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl transition-all border border-slate-200 font-bold text-sm shadow-sm"
            >
              <LayoutTemplate size={18} />
              {headerSignatures ? "امضاها به پایین" : "امضاها به بالا"}
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white px-8 py-2.5 rounded-xl transition-all shadow-lg font-bold active:scale-95 group"
            >
              <Printer size={20} className="group-hover:scale-110 transition-transform" />
              چاپ نهایی جدول
            </button>
          </div>
        </div>

        {/* Individual Margin Controls */}
        <div className="flex items-center gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <Settings2 size={18} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700">تنظیم حاشیه کاغذ (cm):</span>
          </div>
          <div className="flex gap-6 flex-1 justify-center">
            {Object.entries(margins).map(([side, value]) => (
              <div key={side} className="flex items-center gap-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  {side === 'top' ? 'بالا' : side === 'bottom' ? 'پایین' : side === 'right' ? 'راست' : 'چپ'}
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={value} 
                  onChange={(e) => updateMargin(side as keyof typeof margins, e.target.value)}
                  className="margin-input"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div 
        className="a4-landscape relative"
        style={{ 
          '--margin-top': `${margins.top}cm`,
          '--margin-right': `${margins.right}cm`,
          '--margin-bottom': `${margins.bottom}cm`,
          '--margin-left': `${margins.left}cm`,
          fontSize: `${generalFontSize}px`
        } as React.CSSProperties}
      >
        {/* Top Header Section */}
        <div className="flex justify-between items-start mb-2">
          {/* Top Right Info */}
          <div className="flex flex-col gap-1 items-start w-52 text-right text-black font-bold">
            <div style={{ fontSize: `${generalFontSize + 1}px` }}>شماره صفحه: {toPersianNum(1)}</div>
            {headerSignatures && (
              <>
                <div className="mt-2" style={{ fontSize: `${generalFontSize}px` }}>امضاء نگران: ................................</div>
                <div className="mt-2" style={{ fontSize: `${generalFontSize}px` }}>امضاء سرمعلم: ................................</div>
              </>
            )}
          </div>

          {/* Center Logos */}
          <div className="flex flex-col items-center text-center flex-1 text-black">
             <div className="flex items-center gap-6 mb-1">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Emblem_of_Afghanistan.svg/1024px-Emblem_of_Afghanistan.svg.png" alt="Emblem" className="h-16 w-auto grayscale" />
                <div className="flex flex-col">
                  <span className="header-title" style={{ fontSize: '18px' }}>وزارت معارف</span>
                  <span className="sub-header-title" style={{ fontSize: '13px' }}>ریاست معارف ولایت کابل</span>
                  <span className="font-bold" style={{ fontSize: '10px' }}>آمریت معارف حوزه دوازدهم تعلیمی</span>
                  <span className="font-extrabold mt-1" style={{ fontSize: '12px' }}>لیسه عالی خصوصی نیکان</span>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Emblem_of_Afghanistan.svg/1024px-Emblem_of_Afghanistan.svg.png" alt="Emblem" className="h-16 w-auto grayscale" />
             </div>
          </div>

          {/* Top Left Summary Tables */}
          <div className="flex gap-2 items-start text-black">
            <table className="w-32 border border-black" style={{ fontSize: `${generalFontSize - 2}px` }}>
              <thead>
                <tr><th colSpan={2} className="bg-gray-200 py-0.5 border border-black font-bold">نتایج چهارونیم ماهه</th></tr>
              </thead>
              <tbody>
                <tr><td className="text-right-important border border-black px-1">تعداد داخله</td><td className="border border-black">{toPersianNum(1)}</td></tr>
                <tr><td className="text-right-important border border-black px-1">شامل امتحان</td><td className="border border-black">{toPersianNum(1)}</td></tr>
                <tr><td className="text-right-important border border-black px-1 font-bold">موفق</td><td className="border border-black">{toPersianNum(1)}</td></tr>
                <tr><td className="text-right-important border border-black px-1">تلاش بیشتر</td><td className="border border-black">{toPersianNum(0)}</td></tr>
                <tr><td className="text-right-important border border-black px-1">غایب</td><td className="border border-black">{toPersianNum(0)}</td></tr>
              </tbody>
            </table>
            <table className="w-32 text-right border border-black" style={{ fontSize: `${generalFontSize - 2}px` }}>
              <thead>
                <tr><th colSpan={2} className="bg-gray-200 py-0.5 border border-black font-bold">خلص نتایج سالانه</th></tr>
              </thead>
              <tbody className="text-right">
                <tr><td className="text-right-important border border-black px-1">تعداد داخله</td><td className="border border-black">{toPersianNum(1)}</td></tr>
                <tr><td className="text-right-important border border-black px-1">شامل امتحان</td><td className="border border-black">{toPersianNum(1)}</td></tr>
                <tr><td className="text-right-important border border-black px-1 font-bold">موفق</td><td className="border border-black">{toPersianNum(1)}</td></tr>
                <tr><td className="text-right-important border border-black px-1">تکرار صنف</td><td className="border border-black">{toPersianNum(0)}</td></tr>
                <tr><td className="text-right-important border border-black px-1">مشروط</td><td className="border border-black">{toPersianNum(0)}</td></tr>
                <tr><td className="text-right-important border border-black px-1">معذرتی</td><td className="border border-black">{toPersianNum(0)}</td></tr>
                <tr><td className="text-right-important border border-black px-1">محروم</td><td className="border border-black">{toPersianNum(0)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Bar */}
        <div className="grid grid-cols-10 border border-black bg-white text-black mb-1 font-bold" style={{ fontSize: `${generalFontSize + 1}px` }}>
          <div className="col-span-1 border-l border-black p-0.5 text-center">صنف: {toPersianNum("ششم")}</div>
          <div className="col-span-2 border-l border-black p-0.5 text-center">سال تعلیمی: {toPersianNum(1404)} هـ ش</div>
          <div className="col-span-2 border-l border-black p-0.5 text-center">مطابق: {toPersianNum(1447)} هـ ق</div>
          <div className="col-span-2 border-l border-black p-0.5 text-center">نگران صنف: استاد عابد</div>
          <div className="col-span-3 p-1 text-center font-black bg-gray-200 uppercase tracking-widest">جدول نتایج نهایی شاگردان</div>
        </div>

        {/* Main Data Table */}
        <table 
          className="mt-[-1px] w-full border-collapse border border-black text-black leading-tight" 
          style={{ fontSize: `${tableFontSize}px` }}
        >
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
            <tr>
              <td rowSpan={6} className="bg-gray-300 font-bold vertical-text border border-black">شهرت شاگرد</td>
              <td className="font-bold bg-gray-100 text-right-important pr-2 border border-black">شماره ردیف</td>
              {students.map(s => <td key={s.id} colSpan={4} className="font-bold bg-gray-100 border border-black">{toPersianNum(s.id)}</td>)}
            </tr>

            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">اسم شاگرد</td>
              {students.map(s => (
                <React.Fragment key={s.id}>
                  <td colSpan={3} className="border border-black font-bold">{s.name || '---'}</td>
                  {/* سلول ملاحظات با مرزهای تقویت شده */}
                  <td rowSpan={observationRowSpan} className="border border-black bg-white vertical-text observation-cell font-bold">ملاحظات</td>
                </React.Fragment>
              ))}
            </tr>

            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">نام پدر</td>
              {students.map(s => <td key={s.id} colSpan={3} className="border border-black font-bold">{s.fatherName || '---'}</td>)}
            </tr>
            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">نام پدرکلان</td>
              {students.map(s => <td key={s.id} colSpan={3} className="border border-black font-bold">{s.grandfatherName || '---'}</td>)}
            </tr>
            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">نمبر اساس (General)</td>
              {students.map(s => <td key={s.id} colSpan={3} className="border border-black font-bold">{toPersianNum(s.asasNumber) || '---'}</td>)}
            </tr>
            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">نمبر تذکره</td>
              {students.map(s => <td key={s.id} colSpan={3} className="border border-black font-bold">{toPersianNum(s.tazkiraNumber) || '---'}</td>)}
            </tr>

            {/* نمرات هدر بخش امتحانات */}
            <tr className="bg-gray-100">
               <td colSpan={2} className="h-10 font-bold text-center border border-black bg-gray-200">( امتحانات )</td>
               {students.map(s => (
                 <React.Fragment key={s.id}>
                   <td className="vertical-text font-bold py-1 border border-black bg-gray-50">چهارونیم ماهه</td>
                   <td className="vertical-text font-bold py-1 border border-black bg-gray-50">امتحان سالانه</td>
                   <td className="vertical-text font-bold py-1 border border-black bg-gray-200">مجموع نهایی</td>
                 </React.Fragment>
               ))}
            </tr>

            {SUBJECTS.map((sub, idx) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                {idx === 0 && (
                  <td rowSpan={SUBJECTS.length} className="vertical-text font-bold bg-gray-300 border border-black">نمرات مضامین</td>
                )}
                <td className="text-right-important pr-2 font-bold border border-black">{sub.name}</td>
                {students.map(s => (
                  <React.Fragment key={s.id}>
                    <td className="border border-black">{toPersianNum(s.grades[sub.id].q)}</td>
                    <td className="border border-black">{toPersianNum(s.grades[sub.id].a)}</td>
                    <td className="font-bold bg-gray-100 border border-black">{toPersianNum(s.grades[sub.id].f)}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}

            <tr className="bg-gray-100">
              <td rowSpan={4} className="vertical-text font-bold bg-gray-300 border border-black">نتیجه نهایی</td>
              <td className="text-right-important pr-2 font-bold bg-gray-200 border border-black">مجموعه نمرات</td>
              {students.map(s => (
                <React.Fragment key={s.id}>
                  <td className="bg-gray-200 border border-black">{toPersianNum(s.summary.total.q)}</td>
                  <td className="bg-gray-200 border border-black">{toPersianNum(s.summary.total.a)}</td>
                  <td className="font-bold bg-gray-300 border border-black">{toPersianNum(s.summary.total.f)}</td>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">اوسط (Average)</td>
              {students.map(s => (
                <React.Fragment key={s.id}>
                  <td className="border border-black">{toPersianNum(s.summary.average.q)}</td>
                  <td className="border border-black">{toPersianNum(s.summary.average.a)}</td>
                  <td className="font-bold border border-black">{toPersianNum(s.summary.average.f)}</td>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">نتیجه ارتقاء</td>
              {students.map(s => (
                <React.Fragment key={s.id}>
                  <td className="border border-black font-bold">موفق</td>
                  <td colSpan={2} className="border border-black font-bold">ارتقاء صنف</td>
                </React.Fragment>
              ))}
            </tr>
            <tr className="bg-gray-50">
              <td className="text-right-important pr-2 font-bold border border-black">درجه صنف</td>
              {students.map(s => (
                <React.Fragment key={s.id}>
                  <td className="font-bold border border-black">{toPersianNum(s.summary.rank)}</td>
                  <td colSpan={2} className="font-bold border border-black">{toPersianNum(s.summary.rank)}</td>
                </React.Fragment>
              ))}
            </tr>

            <tr>
              <td rowSpan={5} className="vertical-text font-bold bg-gray-300 border border-black">حاضری</td>
              <td className="text-right-important pr-2 font-bold border border-black">ایام درسی</td>
              {students.map(s => (
                <React.Fragment key={s.id}>
                  <td className="border border-black">{toPersianNum(s.attendance.days.q)}</td>
                  <td className="border border-black">{toPersianNum(s.attendance.days.a)}</td>
                  <td className="font-bold border border-black">{toPersianNum(s.attendance.days.f)}</td>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">حاضر</td>
              {students.map(s => (
                <React.Fragment key={s.id}>
                  <td className="border border-black">{toPersianNum(s.attendance.present.q)}</td>
                  <td className="border border-black">{toPersianNum(s.attendance.present.a)}</td>
                  <td className="font-bold border border-black">{toPersianNum(s.attendance.present.f)}</td>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">غیرحاضر</td>
              {students.map(s => (
                <React.Fragment key={s.id}>
                  <td className="border border-black">{toPersianNum(s.attendance.absent.q)}</td>
                  <td className="border border-black">{toPersianNum(s.attendance.absent.a)}</td>
                  <td className="font-bold border border-black">{toPersianNum(s.attendance.absent.f)}</td>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">مریض</td>
              {students.map(s => (
                <React.Fragment key={s.id}>
                  <td className="border border-black">{toPersianNum(s.attendance.sick.q)}</td>
                  <td className="border border-black">{toPersianNum(s.attendance.sick.a)}</td>
                  <td className="font-bold border border-black">{toPersianNum(s.attendance.sick.f)}</td>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <td className="text-right-important pr-2 font-bold border border-black">رخصت</td>
              {students.map(s => (
                <React.Fragment key={s.id}>
                  <td className="border border-black">{toPersianNum(s.attendance.leave.q)}</td>
                  <td className="border border-black">{toPersianNum(s.attendance.leave.a)}</td>
                  <td className="font-bold border border-black">{toPersianNum(s.attendance.leave.f)}</td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Footer Signatures */}
        <div className={`grid ${headerSignatures ? "grid-cols-4" : "grid-cols-6"} mt-4 text-center font-bold items-end px-4 text-black`} style={{ fontSize: `${generalFontSize + 1}px` }}>
          <div className="flex flex-col items-center">
            <span className="mb-4 font-bold">مهر و امضاء مدیر لیسه</span>
            <div className="w-full max-w-[120px] border-t border-black border-dashed mt-1"></div>
          </div>
          {!headerSignatures && (
            <>
              <div className="flex flex-col items-center">
                <span className="mb-4 font-bold">امضاء نگران صنف</span>
                <div className="w-full max-w-[120px] border-t border-black border-dashed mt-1"></div>
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-4 font-bold">امضاء سرمعلم</span>
                <div className="w-full max-w-[120px] border-t border-black border-dashed mt-1"></div>
              </div>
            </>
          )}
          <div className="flex flex-col items-center">
            <span className="mb-4 font-bold">هیئت ممتحن</span>
            <div className="w-full max-w-[120px] border-t border-black border-dashed mt-1"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="mb-4 font-bold">هیئت ممتحن</span>
            <div className="w-full max-w-[120px] border-t border-black border-dashed mt-1"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="mb-4 font-bold">آمریت حوزه تعلیمی</span>
            <div className="w-full max-w-[120px] border-t border-black border-dashed mt-1"></div>
          </div>
        </div>
      </div>

      <footer className="no-print mt-8 text-slate-400 text-xs pb-10 font-medium">
        لیسه عالی خصوصی نیکان - سیستم صدور اسناد تعلیمی دیجیتال
      </footer>
    </div>
  );
};

export default App;
