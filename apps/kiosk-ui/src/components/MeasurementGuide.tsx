interface MeasurementGuideProps {
    title: string;
    instruction: string;
    imageSrc?: string; // Placeholder for now
    onStart: () => void;
}

export default function MeasurementGuide({ title, instruction, onStart }: MeasurementGuideProps) {
    return (
        <div className="flex flex-col items-center justify-between min-h-screen p-12 bg-slate-50">
            <h2 className="text-4xl font-bold text-slate-800">{title}</h2>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-64 h-64 bg-slate-200 rounded-lg flex items-center justify-center mb-8">
                    [Instructional Image]
                </div>
                <p className="text-2xl text-center max-w-2xl text-slate-600">{instruction}</p>
            </div>

            <button
                onClick={onStart}
                className="w-full max-w-md py-6 bg-teal-600 text-white text-2xl font-bold rounded-xl hover:bg-teal-700 transition"
            >
                Start Measurement
            </button>
        </div>
    );
}
