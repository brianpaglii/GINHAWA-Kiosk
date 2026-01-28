import { useEffect, useState } from 'react';
import { useSensors } from '@/hooks/useSensors';

interface LiveMonitorProps {
    sensorType: 'bp' | 'spo2' | 'weight' | 'height' | 'temperature';
    onComplete: (data: any) => void;
}

export default function LiveMonitor({ sensorType, onComplete }: LiveMonitorProps) {
    const { data, isConnected } = useSensors(true);
    const [status, setStatus] = useState("Waiting for sensor...");

    // Trigger sensor on mount (via API call in parent usually, but we can do it here if needed)
    // Actually, the plan said "Mock Hardware Trigger -> See Live Numbers". 
    // In a real device, the user puts their arm in and it auto-starts or they press start. 
    // Let's assume the parent calls the trigger API, and we just listen.
    // BUT, since we need to Trigger it from the UI for this simulation:

    useEffect(() => {
        // Auto-trigger for simulation purposes after a short delay
        const trigger = async () => {
            await fetch(`http://localhost:8000/hardware/trigger/${sensorType}?session_id=TEMP`, { method: 'POST' });
        };
        const timer = setTimeout(trigger, 1000); // Wait 1s then trigger
        return () => clearTimeout(timer);
    }, [sensorType]);

    useEffect(() => {
        if (data && data.sensor === sensorType) {
            setStatus("Measurement Complete!");
            setTimeout(() => {
                onComplete(data.data);
            }, 2000); // Show result for 2s then move on
        }
    }, [data, sensorType, onComplete]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
            <h2 className="text-3xl mb-4 font-mono uppercase">{sensorType} Measurement</h2>

            <div className="text-xl mb-8 opacity-75">
                {isConnected ? "Sensor Connected" : "Connecting to Sensor..."}
            </div>

            <div className="bg-black/30 p-12 rounded-2xl w-full max-w-2xl text-center border-2 border-teal-500/50">
                {/* Visualization would go here */}

                {data && data.sensor === sensorType ? (
                    <div className="animate-bounce">
                        {Object.entries(data.data).map(([key, value]) => (
                            <div key={key} className="text-5xl font-bold mb-2">
                                {key.toUpperCase()}: <span className="text-teal-400">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-4xl animate-pulse">
                        Measuring...
                    </div>
                )}
            </div>

            <p className="mt-8 text-lg">{status}</p>
        </div>
    );
}
