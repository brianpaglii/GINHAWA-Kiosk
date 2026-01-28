import { useEffect } from 'react';

interface IdleScreenProps {
    onAuth: (rfid: string) => void;
}

export default function IdleScreen({ onAuth }: IdleScreenProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Simulator: Press 'Enter' to simulate an RFID scan
            if (e.key === 'Enter') {
                // In a real kiosk, the RFID reader acts as a keyboard and types the ID followed by Enter
                // We'll simulate a random RFID for now or a fixed one
                const mockRFID = "RFID-0001";
                onAuth(mockRFID);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onAuth]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white cursor-none">
            <h1 className="text-6xl font-bold mb-8 animate-pulse">GINHAWA HEALTH KIOSK</h1>
            <div className="bg-white/10 p-8 rounded-full mb-8">
                {/* Icon Placeholder */}
                <div className="w-32 h-32 bg-teal-500 rounded-full flex items-center justify-center text-4xl">
                    Tap
                </div>
            </div>
            <p className="text-2xl opacity-80">Tap your Citizen ID Card to Start</p>
            <p className="text-sm mt-8 opacity-50 mb-8">(or press Enter to simulate)</p>

            <button
                onClick={() => {
                    console.log("Manual trigger clicked");
                    onAuth("RFID-0001");
                }}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition"
            >
                [Dev] Simulate Scan (RFID-0001)
            </button>
        </div>
    );
}
