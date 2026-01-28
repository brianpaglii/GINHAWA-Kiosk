import time
import requests
import schedule
from sqlalchemy.orm import Session as DBSession
from datetime import datetime
import sys
import os

# Path hack
sys.path.append(os.path.join(os.getcwd(), "../../../packages"))
sys.path.append(os.path.join(os.getcwd(), "../")) # for database from kiosk-backend

from shared.db.models import Session, Measurement
from shared.schemas.session import SessionDTO
from database import SessionLocal # Import from kiosk-backend database.py

CLOUD_API_URL = "http://localhost:8001/api/sync" # Cloud runs on 8001 (mapped in docker or separate port)

class SyncDaemon:
    def __init__(self):
        self.running = False

    def sync_job(self):
        print("[Sync] Checking for unsynced data...")
        db: DBSession = SessionLocal()
        try:
            # Find unsynced, finished sessions
            unsynced_sessions = db.query(Session).filter(
                Session.is_synced == False,
                Session.ended_at != None
            ).limit(10).all()

            if not unsynced_sessions:
                print("[Sync] No data to sync.")
                return

            print(f"[Sync] Found {len(unsynced_sessions)} sessions to sync.")
            
            # Serialize
            payload = [SessionDTO.from_orm(s).dict() for s in unsynced_sessions]
            
            # Send to Cloud
            # Note: json serialization of datetime might need custom encoder if using requests directly
            # Pydantic .json() handles it but we have a list. 
            # Requests json parameter handles standard types, but datetime needs isoformat.
            # Using pydantic's json serialization might be safer.
            
            # Simplification: convert datetimes to str in payload manually or use pydantic json
            import json
            class DateTimeEncoder(json.JSONEncoder):
                def default(self, o):
                    if isinstance(o, datetime):
                        return o.isoformat()
                    return super().default(o)

            response = requests.post(
                CLOUD_API_URL, 
                data=json.dumps(payload, cls=DateTimeEncoder),
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                print("[Sync] Sync successful.")
                # Mark as synced
                result = response.json()
                synced_ids = result.get("synced_ids", [])
                
                for s in unsynced_sessions:
                    if s.id in synced_ids:
                        s.is_synced = True
                db.commit()
            else:
                print(f"[Sync] Failed: {response.text}")

        except Exception as e:
            print(f"[Sync] Error: {e}")
        finally:
            db.close()

    def start(self):
        self.running = True
        schedule.every(30).seconds.do(self.sync_job)
        
        print("[Sync] Daemon started.")
        while self.running:
            schedule.run_pending()
            time.sleep(1)

if __name__ == "__main__":
    daemon = SyncDaemon()
    try:
        daemon.start()
    except KeyboardInterrupt:
        print("[Sync] Stopping...")
