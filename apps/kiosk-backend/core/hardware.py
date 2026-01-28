import asyncio
import random
import json
from datetime import datetime
from typing import Callable, Optional

class HardwareService:
    def __init__(self):
        self._listeners: list[Callable] = []
        self._is_running = False

    async def trigger_sensor(self, sensor_type: str, session_id: str) -> dict:
        """
        Simulates triggering a physical sensor.
        Returns the data after a Simulated delay.
        """
        print(f"[Hardware] Triggering {sensor_type} for session {session_id}")
        
        # Simulate hardware delay (e.g., BP cuff inflating, Scale settling)
        delay = 2 if sensor_type == "weight" else 5
        await asyncio.sleep(delay)
        
        data = {}
        if sensor_type == "bp":
            systolic = random.randint(110, 140)
            diastolic = random.randint(70, 90)
            data = {
                "systolic": systolic,
                "diastolic": diastolic,
                "unit": "mmHg"
            }
        elif sensor_type == "weight":
            data = {
                "weight": round(random.uniform(50.0, 90.0), 1),
                "unit": "kg"
            }
        elif sensor_type == "spo2":
            data = {
                "spo2": random.randint(95, 99),
                "heart_rate": random.randint(60, 100),
                "unit": "%"
            }
        elif sensor_type == "height":
            data = {
                "height": round(random.uniform(150.0, 190.0), 1),
                "unit": "cm"
            }
        elif sensor_type == "temperature":
            data = {
                "temperature": round(random.uniform(36.1, 37.5), 1),
                "unit": "degC"
            }
        
        result = {
            "sensor": sensor_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id
        }
        
        # Notify WebSocket listeners
        await self.broadcast(result)
        
        return result

    async def broadcast(self, message: dict):
        for listener in self._listeners:
            try:
                await listener(message)
            except Exception as e:
                print(f"Error broadcasting to listener: {e}")

    def add_listener(self, listener: Callable):
        self._listeners.append(listener)

    def remove_listener(self, listener: Callable):
        if listener in self._listeners:
            self._listeners.remove(listener)

# Singleton instance
hardware_service = HardwareService()
