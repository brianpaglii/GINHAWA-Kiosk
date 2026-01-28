**GINHAWA Implementation Plan**


This document outlines the technical execution strategy for the GINHAWA Health Kiosk system, translating the academic requirements from the provided thesis into a production-ready engineering plan.

**Role:** Senior Principal Engineer
**Target Audience:** AI Agent / Dev Team
**Date:** January 28, 2026

---

## 1. System Architecture & Tech Stack

The system follows a **Hybrid Edge-Cloud Architecture**. The Kiosk operates as an autonomous edge device (Offline-First), synchronizing with a Cloud Web Portal for data aggregation.

### **1.1 Tech Stack**


| Component | Technology | Rationale |
| --- | --- | --- |
| **Kiosk Frontend** | **Next.js 14** (App Router) | React-based UI for complex state management (Sensor Guides). Deployed as a standalone app on Pi. |
| **Kiosk Backend** | **FastAPI** (Python) | High-performance async API to handle Hardware I/O (Serial/I2C) and Local DB. |
| **Kiosk Database** | **SQLite** (with SQLAlchemy) | Lightweight, serverless, file-based storage ideal for edge devices. |
| **Web Portal** | **Next.js 14** | Admin dashboard for Barangay Health Workers (BHWs). |
| **Cloud Backend** | **FastAPI** (Python) | REST API for data synchronization and aggregation. |
| **Cloud Database** | **PostgreSQL** | Scalable relational database for community-wide data. |
| **Hardware IO** | **Python `pyserial`, `smbus2**` | Libraries to communicate with ESP32s and Sensors from the Pi. |

### **1.2 High-Level Data Flow**

1. **Sensors** (ESP32s)  **Serial/MQTT**  **Kiosk Backend** (FastAPI).
2. **Kiosk Backend**  **Local SQLite** (Store Data).
3. **Kiosk Frontend** (Next.js)  Polls/WebSockets  **Kiosk Backend** (UI Updates).
4. **Sync Daemon** (Background Task)  Pushes Local Data  **Cloud Backend**.

---


## 2. Folder Structure (Monorepo)

The project will be structured as a monorepo to share types and schemas between Kiosk and Cloud.

```text
/ginhawa-monorepo
├── /apps
│   ├── /kiosk-ui           # Next.js App (Touchscreen Interface)
│   │   ├── /src/app/session # Guided Measurement Flow (Idle -> Measure -> Print)
│   │   └── /src/components # UI Components (Gauge, Timer, Instructions)
│   │
│   ├── /web-portal         # Next.js App (BHW Dashboard)
│   │   ├── /src/app/dashboard # Analytics & Reports
│   │   └── /src/app/admin   # User Management
│   │
│   ├── /kiosk-backend      # FastAPI (Runs on Raspberry Pi)
│   │   ├── /api            # Endpoints (start_session, get_readings)
│   │   ├── /core           # Hardware Drivers (Serial, Printer, GPIO)
│   │   ├── /db             # SQLite Session Manager
│   │   └── /sync           # Cloud Synchronization Logic
│   │
│   └── /cloud-backend      # FastAPI (Runs on Cloud/Server)
│       └── /api            # Endpoints (sync_data, generate_reports)
│
├── /packages
│   └── /shared             # Shared Pydantic Models & Utils
│       ├── /schemas        # Data Transfer Objects (DTOs)
│       └── /types          # TypeScript Interfaces
│
└── docker-compose.yml      # For local dev & Cloud deployment

```


---

## 3. Database Schema


Based on **Figure 3.7 (Page 45)** of the thesis, we will implement the following using **SQLAlchemy (ORM)** and **Pydantic (Validation)**.

### **3.1 SQLAlchemy Models (`/kiosk-backend/db/models.py`)**

```python
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()


class Citizen(Base):
    __tablename__ = "citizens"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    rfid_uid = Column(String, unique=True, index=True) # Physical Card UID
    full_name = Column(String, nullable=False)
    dob = Column(DateTime, nullable=False)
    sex = Column(String, nullable=False)
    barangay = Column(String, nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow)
    
    sessions = relationship("Session", back_populates="citizen")


class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    citizen_id = Column(String, ForeignKey("citizens.id"))
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    is_synced = Column(Boolean, default=False) # Sync Status Track
    
    citizen = relationship("Citizen", back_populates="sessions")
    measurements = relationship("Measurement", back_populates="session")

class Measurement(Base):
    __tablename__ = "measurements"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"))
    device_id = Column(String) # E.g., "ESP32-A", "ESP32-B"
    type = Column(String)      # E.g., "systolic", "diastolic", "spO2", "weight"

    value = Column(String)     # Stored as string to preserve precision/format
    unit = Column(String)      # E.g., "mmHg", "%", "kg"

    raw_json = Column(Text)    # Full debug payload from sensor
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("Session", back_populates="measurements")


```

---

## 4. API Specification


### **4.1 Kiosk Backend (Edge API)**

This API controls the hardware state machine described in **Figure 3.8 Session Flow** (Page 46).

| Method | Endpoint | Description |
| --- | --- | --- |
| **GET** | `/status` | Returns current Kiosk State (IDLE, MEASURING, ERROR). |
| **POST** | `/session/auth` | Accepts RFID UID. Returns `citizen_profile` or 404. |
| **POST** | `/session/start` | Initializes a new session ID in SQLite. |
| **POST** | `/hardware/trigger/{sensor}` | Triggers specific sensor (e.g., `bp_cuff`, `scale`). Sends command to ESP32 via Serial/MQTT. |
| **GET** | `/hardware/stream` | WebSocket endpoint for real-time sensor data (for UI visualization). |
| **POST** | `/session/print` | Formats session summary and sends to Thermal Printer. |
| **POST** | `/sync/trigger` | Manually triggers the Cloud Synchronization daemon. |

### **4.2 Web Portal (Cloud API)**

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/api/sync` | Receives batch JSON from Kiosk (Offline-First Sync). |
| **GET** | `/api/citizens` | Returns list of citizens with pagination/filtering. |
| **GET** | `/api/reports/demographics` | Aggregated data for charts (Age/Sex/BMI distribution). |

---

## 5. Step-by-Step Task List for AI Agent

Copy and paste these tasks into your issue tracker or prompt the AI to execute them sequentially.

### **Phase 1: Foundation & Database**

* [ ] **Task 1.1:** Initialize Monorepo structure with `apps/` and `packages/`.
* [ ] **Task 1.2:** Set up Docker Compose for local development (PostgreSQL, Adminer, Python containers).
* [ ] **Task 1.3:** Implement SQLAlchemy models (`Citizen`, `Session`, `Measurement`) in `/packages/shared`.
* [ ] **Task 1.4:** Create Pydantic schemas (`CitizenDTO`, `SessionCreate`) for API validation.

* [ ] **Task 1.5:** Write a seed script to populate SQLite with dummy data for testing (10 citizens, 50 measurements).

### **Phase 2: Kiosk Backend (FastAPI)**


* [ ] **Task 2.1:** Setup FastAPI app in `/apps/kiosk-backend`. Configure CORS.
* [ ] **Task 2.2:** Implement **Hardware Mocking Layer**. *Crucial:* Create a service that simulates ESP32 serial data (returns random valid BP/SpO2 values) so UI can be developed without physical sensors.
* [ ] **Task 2.3:** Implement `/session` endpoints (Start, End, Save Measurement).
* [ ] **Task 2.4:** Implement **WebSocket** endpoint at `/ws/sensors` to stream "Real-time" mocked sensor data.

* [ ] **Task 2.5:** Implement Printer Service (Use `python-escpos` or similar library, mocked for dev).

### **Phase 3: Kiosk Frontend (Next.js)**

* [ ] **Task 3.1:** Initialize Next.js app. Configure Tailwind CSS.
* [ ] **Task 3.2:** Build **State Machine Hook** (`useKioskState`). States: `IDLE` -> `AUTH` -> `MENU` -> `GUIDE_{TYPE}` -> `MEASURING` -> `RESULT` -> `PRINT` -> `IDLE`.
* [ ] **Task 3.3:** Build **Idle Screen**. Listen for keyboard input (simulating RFID scanner keystrokes).
* [ ] **Task 3.4:** Build **Measurement Guide Components**. Create reusable screens with large text/images for "Insert Arm", "Stand Still", etc.

* [ ] **Task 3.5:** Integrate WebSocket client to display real-time sensor graphs (e.g., live heart rate line) during `MEASURING` state.

* [ ] **Task 3.6:** Build **Result/Report View**. Display BMI calculation (Logic: ) and Health Advice based on thresholds.

### **Phase 4: Web Portal & Cloud Sync**

* [ ] **Task 4.1:** Initialize Cloud FastAPI. Implement `/sync` endpoint that accepts a list of sessions/measurements and upserts them to PostgreSQL.
* [ ] **Task 4.2:** Implement **Sync Daemon** in Kiosk Backend. Background thread that checks for internet, POSTs unsynced data to Cloud, and marks `is_synced=True` in SQLite on success.
* [ ] **Task 4.3:** Build Web Portal Dashboard (Next.js). Create a table view for Citizens.
* [ ] **Task 4.4:** Implement **Data Visualization** using `Recharts` or `Chart.js` for Demographics (Age/Gender distribution) and Health Trends (Avg BP per Barangay).

### **Phase 5: Deployment & Hardening**


* [ ] **Task 5.1:** Configure Kiosk Next.js for **Static Export** (`output: 'export'`) or **Standalone** mode to run efficiently on Pi.
* [ ] **Task 5.2:** Create `systemd` service files to auto-start FastAPI and Next.js on Raspberry Pi boot.
* [ ] **Task 5.3:** Implement **Kiosk Mode** instructions (Chromium full screen, disable touch gestures for exit).
* [ ] **Task 5.4:** Write `README.md` with instructions on how to flash ESP32 firmware (referenced in Thesis Page 44).
