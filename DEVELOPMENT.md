# GINHAWA Development Guide

This guide details the steps to set up the development environment for the GINHAWA Kiosk and Web Portal functionality.

## 1. Prerequisites

Ensure you have the following installed:
*   **Docker & Docker Compose**: For running the backends and databases.
*   **Python 3.11+**: For local scripting and shared package development.
*   **Node.js 18+**: For the Next.js frontends.

## 2. Python Environment Setup

We use a Python virtual environment to manage dependencies for scripts and shared packages.

1.  **Create a virtual environment** (if not exists):
    ```bash
    python -m venv .venv
    ```

2.  **Activate the environment**:
    ```bash
    source .venv/bin/activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

## 3. Starting the Backends (Docker)

The Kiosk Backend, Cloud Backend, and Databases run inside Docker containers.

1.  **Start Services**:
    ```bash
    sudo docker-compose up -d --build
    ```

2.  **Check Logs**:
    ```bash
    sudo docker logs -f ginhawa-kiosk-backend-1
    ```

3.  **Access Endpoints**:
    *   Kiosk Backend: [http://localhost:8000](http://localhost:8000)
    *   Cloud Backend: [http://localhost:8001](http://localhost:8001)
    *   Adminer (DB GUI): [http://localhost:8080](http://localhost:8080)

## 4. Frontend Application Setup

There are two frontend applications: **Kiosk UI** (for the physical machine) and **Web Portal** (for admins).

### Kiosk UI (Port 3000)
1.  Navigate to directory:
    ```bash
    cd apps/kiosk-ui
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run development server:
    ```bash
    npm run dev
    ```
    Access at [http://localhost:3000](http://localhost:3000).

### Web Portal (Port 3001)
1.  Navigate to directory:
    ```bash
    cd apps/web-portal
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run development server (custom port):
    ```bash
    npm run dev -- -p 3001
    ```
    Access at [http://localhost:3001](http://localhost:3001).

## 5. Database Management

### Initial Seeding
To populate the database with dummy data (Citizens, etc.):
1.  Run the seed script inside the Docker container (recommended):
    ```bash
    sudo docker exec ginhawa-kiosk-backend-1 python seed_internal.py
    ```

### Troubleshooting Database Permissions
If you see `sqlite3.OperationalError: attempt to write a readonly database`, it means Docker created the database file as `root`. Fix it by claiming ownership:

```bash
sudo chown $USER:$USER apps/kiosk-backend/ginhawa_kiosk.db
```

Then restart the backend:
```bash
sudo docker restart ginhawa-kiosk-backend-1
```
