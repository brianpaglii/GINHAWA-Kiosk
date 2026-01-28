import { useState, useEffect, useRef } from 'react';

export const useSensors = (isActive: boolean) => {
    const [data, setData] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!isActive) {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            return;
        }

        // Connect to Kiosk Backend
        // Assuming Backend is at localhost:8000
        const socket = new WebSocket('ws://localhost:8000/hardware/ws/sensors');

        socket.onopen = () => {
            console.log('Sensor WS Connected');
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setData(message);
        };

        socket.onclose = () => {
            console.log('Sensor WS Disconnected');
            setIsConnected(false);
        };

        ws.current = socket;

        return () => {
            if (socket.readyState === 1) { // OPEN
                socket.close();
            }
        };
    }, [isActive]);

    return { data, isConnected };
};
