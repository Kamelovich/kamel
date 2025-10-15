
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- TYPE DEFINITIONS ---
interface Duration {
  years: number;
  months: number;
  days: number;
}

interface ExperiencePeriod {
  id: string;
  startDate: string;
  endDate: string;
}

// --- UTILITY FUNCTIONS ---
const calculateDuration = (startDate: string, endDate: string): Duration => {
  const d1 = new Date(startDate);
  const d2 = new Date(endDate);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d1 > d2) {
    return { years: 0, months: 0, days: 0 };
  }
  
  // Add one day to make the end date inclusive
  d2.setDate(d2.getDate() + 1);

  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();

  if (days < 0) {
    months--;
    const lastDayOfPrevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
    days += lastDayOfPrevMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};

const sumDurations = (durations: Duration[]): Duration => {
  const total = durations.reduce((acc, curr) => {
    acc.days += curr.days;
    acc.months += curr.months;
    acc.years += curr.years;
    return acc;
  }, { years: 0, months: 0, days: 0 });

  // Normalize days to months (using 30 as a standard)
  if (total.days >= 30) {
    total.months += Math.floor(total.days / 30);
    total.days %= 30;
  }

  // Normalize months to years
  if (total.months >= 12) {
    total.years += Math.floor(total.months / 12);
    total.months %= 12;
  }

  return total;
};

const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};


// --- SVG ICONS ---
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

// --- UI COMPONENTS ---

interface ExperienceFormProps {
    onAddExperience: (period: Omit<ExperiencePeriod, 'id'>) => void;
}
const ExperienceForm: React.FC<ExperienceFormProps> = ({ onAddExperience }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            setError('الرجاء إدخال تاريخي البدء والانتهاء.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError('تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء.');
            return;
        }
        onAddExperience({ startDate, endDate });
        setStartDate('');
        setEndDate('');
        setError(null);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1">تاريخ البدء</label>
                    <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1">تاريخ الانتهاء</label>
                    <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                </div>
            </div>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <button type="submit" className="mt-4 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200">
                <PlusIcon className="w-5 h-5" />
                <span>إضافة فترة عمل</span>
            </button>
        </form>
    );
};


interface ExperienceSummaryProps {
    totalExperience: Duration;
}
const ExperienceSummary: React.FC<ExperienceSummaryProps> = ({ totalExperience }) => {
    const { years, months, days } = totalExperience;
    return (
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white p-6 rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-bold mb-2 text-cyan-100">الخبرة المهنية الإجمالية</h2>
            <div className="flex justify-center items-baseline space-x-6 space-x-reverse text-3xl font-bold">
                <div className="flex flex-col items-center">
                    <span className="text-5xl">{years}</span>
                    <span className="text-sm font-normal text-cyan-200 mt-1">سنوات</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-5xl">{months}</span>
                    <span className="text-sm font-normal text-cyan-200 mt-1">أشهر</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-5xl">{days}</span>
                    <span className="text-sm font-normal text-cyan-200 mt-1">أيام</span>
                </div>
            </div>
        </div>
    );
};


interface ExperienceListProps {
    periods: ExperiencePeriod[];
    onDeleteExperience: (id: string) => void;
}
const ExperienceList: React.FC<ExperienceListProps> = ({ periods, onDeleteExperience }) => {
    if (periods.length === 0) {
        return (
            <div className="text-center py-10 px-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-slate-500">لم يتم إضافة أي فترة عمل حتى الآن.</p>
                <p className="text-slate-400 text-sm mt-1">استخدم النموذج أعلاه لإضافة خبراتك المهنية.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-3">قائمة فترات العمل</h3>
            <ul className="space-y-4">
                {periods.map(period => {
                    const duration = calculateDuration(period.startDate, period.endDate);
                    return (
                        <li key={period.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between transition-shadow hover:shadow-md">
                            <div className="flex-1">
                                <p className="font-semibold text-slate-700">
                                    <span className="text-teal-600">من:</span> {formatDate(period.startDate)}
                                    <span className="mx-2 text-slate-400">|</span>
                                    <span className="text-teal-600">إلى:</span> {formatDate(period.endDate)}
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    المدة: {duration.years} سنوات, {duration.months} أشهر, {duration.days} أيام
                                </p>
                            </div>
                            <button onClick={() => onDeleteExperience(period.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200" aria-label="حذف الفترة">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [experiencePeriods, setExperiencePeriods] = useState<ExperiencePeriod[]>([]);
    
    const totalExperience = useMemo(() => {
        const durations = experiencePeriods.map(p => calculateDuration(p.startDate, p.endDate));
        return sumDurations(durations);
    }, [experiencePeriods]);

    const addExperience = useCallback((period: Omit<ExperiencePeriod, 'id'>) => {
        const newPeriod: ExperiencePeriod = {
            ...period,
            id: new Date().toISOString() + Math.random(),
        };
        setExperiencePeriods(prev => [...prev, newPeriod]);
    }, []);

    const deleteExperience = useCallback((id: string) => {
        setExperiencePeriods(prev => prev.filter(p => p.id !== id));
    }, []);
    
    const resetCalculator = useCallback(() => {
      setExperiencePeriods([]);
    }, []);

    return (
        <div className="bg-slate-100 min-h-screen py-8 sm:py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">حاسبة الخبرة المهنية</h1>
                    <p className="text-slate-600 mt-2">أداة بسيطة لحساب إجمالي خبرتك المهنية في الجزائر</p>
                </header>
                
                <main className="space-y-8">
                    <ExperienceForm onAddExperience={addExperience} />
                    
                    <div className="space-y-6">
                        <ExperienceSummary totalExperience={totalExperience} />
                        <ExperienceList periods={experiencePeriods} onDeleteExperience={deleteExperience} />
                    </div>

                    {experiencePeriods.length > 0 && (
                        <div className="text-center pt-4">
                            <button
                                onClick={resetCalculator}
                                className="px-6 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
                            >
                                إعادة تعيين الحاسبة
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
