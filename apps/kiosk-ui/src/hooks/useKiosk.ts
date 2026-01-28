import { useState, useEffect } from 'react';
import { KioskState, Citizen, Session } from '@/types/kiosk';

const API_URL = 'http://localhost:8000';

export const useKiosk = () => {
    const [state, setState] = useState<KioskState>('IDLE');
    const [citizen, setCitizen] = useState<Citizen | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Transition Helpers
    const transition = (newState: KioskState) => {
        console.log(`Transitioning from ${state} to ${newState}`);
        setState(newState);
    };

    // Actions
    const authCitizen = async (rfid: string) => {
        try {
            const res = await fetch(`${API_URL}/session/auth?rfid_uid=${rfid}`, { method: 'POST' });
            if (!res.ok) throw new Error('Citizen not found');
            const data = await res.json();
            setCitizen(data);
            transition('DASHBOARD');
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const startSession = async () => {
        if (!citizen) return;
        try {
            const res = await fetch(`${API_URL}/session/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ citizen_id: citizen.id })
            });
            const data = await res.json();
            setSession(data);
            transition('MEASURING_BP'); // Start flow with BP
        } catch (err: any) {
            setError("Failed to start session");
        }
    };

    const saveMeasurement = async (type: string, value: string, unit: string, raw_json?: string) => {
        if (!session) return;
        // Mock random device ID
        const payload = {
            session_id: session.id,
            device_id: "Internal_Mock",
            type,
            value,
            unit,
            raw_json
        };

        await fetch(`${API_URL}/session/${session.id}/measurement`, {
            method: 'POST', // Corrected from duplicate fetch call in previous snippet
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Update local state immediately so UI reflects it
        setSession(prev => {
            if (!prev) return null;
            return {
                ...prev,
                measurements: [...prev.measurements, { type, value, unit }]
            };
        });
    };

    const endSession = async () => {
        if (!session) return;
        await fetch(`${API_URL}/session/end/${session.id}`, { method: 'POST' });
        transition('RESULTS');
    }

    const printTicket = async () => {
        if (!session) return;
        await fetch(`${API_URL}/session/${session.id}/print`, { method: 'POST' });
        transition('PRINTING');
        setTimeout(() => {
            // Reset after printing
            setCitizen(null);
            setSession(null);
            transition('IDLE');
        }, 5000);
    }

    return {
        state,
        citizen,
        session,
        error,
        authCitizen,
        startSession,
        saveMeasurement,
        endSession,
        printTicket,
        transition
    };
};
