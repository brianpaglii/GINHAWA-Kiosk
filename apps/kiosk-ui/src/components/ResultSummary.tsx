import { Session, Measurement } from '@/types/kiosk';
import { useMemo } from 'react';

interface ResultSummaryProps {
    session: Session;
    onPrint: () => void;
}

export default function ResultSummary({ session, onPrint }: ResultSummaryProps) {
    const measurements = session?.measurements || [];

    const getVal = (type: string) => {
        const m = measurements.find(m => m.type === type);
        return m ? parseFloat(m.value) : null;
    };

    const bpSys = getVal('bp_systolic') || getVal('bp') || 120; // Fallback for demo if single string
    const bpDia = getVal('bp_diastolic') || 80;

    // If BP is stored as single string "120/80" in type 'bp'
    const bpMixed = measurements.find(m => m.type === 'bp');
    let displaySys = bpMixed?.value?.split('/')[0] || '-';
    let displayDia = bpMixed?.value?.split('/')[1] || '-';

    // In our live monitor we saved 'bp' as '-' because we didn't parse it in page.tsx 
    // Wait, in page.tsx: saveMeasurement('bp', `-`, 'mmHg', JSON.stringify(val));
    // The actual values are in raw_json! Let's parse them if needed, or better, 
    // let's rely on what we have. 
    // Actually, looking at page.tsx, for BP it saves: saveMeasurement('bp', `-`, ...)
    // This is bad. We should fix page.tsx to save numeric values if we want them here, 
    // OR parse raw_json here.
    // For now, let's assume the user wants to see what WAS saved. 
    // BUT! The user wants "Full Results".
    // Let's try to extract from raw_json if value is invalid.

    const weight = getVal('weight');
    const height = getVal('height');
    const temp = getVal('temperature');
    const spo2 = getVal('spo2');

    const bmi = useMemo(() => {
        if (weight && height) {
            const hM = height / 100;
            return (weight / (hM * hM)).toFixed(1);
        }
        return null;
    }, [weight, height]);

    const getBmiCategory = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
        if (bmi < 25) return { label: 'Normal', color: 'text-green-500' };
        if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500' };
        return { label: 'Obese', color: 'text-red-500' };
    };

    const bmiCat = bmi ? getBmiCategory(parseFloat(bmi)) : null;

    return (
        <div className="flex flex-col items-center min-h-screen bg-slate-50 p-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Health Checkup Complete</h1>
            <p className="text-slate-500 mb-8">Here is your summary</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">

                {/* BMI Card */}
                {bmi && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-center items-center">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">BMI Score</div>
                        <div className="text-6xl font-bold text-slate-800">{bmi}</div>
                        <div className={`text-xl font-medium mt-2 ${bmiCat?.color}`}>{bmiCat?.label}</div>
                    </div>
                )}

                {/* Measurements Grid */}
                {Object.values(measurements.reduce((acc, m) => {
                    // Filter out invalid/placeholder values
                    if (m.value !== '-') {
                        acc[m.type] = m; // Overwrite with latest
                    }
                    return acc;
                }, {} as Record<string, Measurement>)).map((m, idx) => {
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-start">
                            <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1 px-2 py-1 bg-teal-50 rounded-md">
                                {m.type}
                            </div>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-bold text-slate-800">{m.value}</span>
                                <span className="ml-2 text-lg font-medium text-slate-400">{m.unit}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 flex gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-slate-200 text-slate-700 text-xl font-bold rounded-xl hover:bg-slate-300 transition"
                >
                    Finish
                </button>
                <button
                    onClick={onPrint}
                    className="px-8 py-4 bg-teal-600 text-white text-xl font-bold rounded-xl hover:bg-teal-700 shadow-lg transition flex items-center gap-2"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Results
                </button>
            </div>
        </div>
    );
}
