from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from core.hardware import hardware_service
import asyncio

router = APIRouter()

@router.post("/trigger/{sensor_type}")
async def trigger_sensor(sensor_type: str, session_id: str):
    # This just triggers the async process, the result will come via WebSocket
    # But for simplicity, we can also wait and return it here if needed.
    # We'll just return "Triggered" and let WS handle the data.
    asyncio.create_task(hardware_service.trigger_sensor(sensor_type, session_id))
    return {"status": "triggered", "sensor": sensor_type}

@router.websocket("/ws/sensors")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    async def send_sensor_data(data: dict):
        await websocket.send_json(data)
        
    hardware_service.add_listener(send_sensor_data)
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        hardware_service.remove_listener(send_sensor_data)
