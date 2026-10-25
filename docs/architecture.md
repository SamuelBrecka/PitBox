# PitBox – Digital Service Book Concept and Architecture

This document summarizes the outcomes of the initial interview and converts them into the finalized operational design, database schema, visual identity, and lightweight technology stack for the **PitBox** application.

---

## 1. User Flows & Screen Specifications

For the average vehicle owner, the application must be visually appealing and straightforward—ranging from the public Landing Page to an informative vehicle dashboard featuring photos and circular gauge indicators.

```mermaid
flowchart LR
    Landing["0. Public Landing Page"] --> Login["1. Authentication / JWT"]
    Login --> Dash["2. Main Dashboard (My Garage)"]
    Dash --> QuickKm["Quick Odometer Update"]
    Dash --> CarDetail["3. Vehicle Detail + Photo"]
    CarDetail --> History["Service History (Timeline)"]
    CarDetail --> NewService["4. Log Service + Attachments"]
    CarDetail --> Reminders["5. Reminders & Gauges (Oil/Inspection)"]
    CarDetail --> Stats["6. Cost Statistics & Charts"]
```

### Core Application Screens:

0. **Public Landing Page (Unauthenticated Users)**
   - **Hero Section:** Introduction to **PitBox**, brand slogan (e.g., *"Your digital service book and vehicle history in one place"*), visual dashboard preview, and clear CTA buttons: **Sign In** / **Create Account**.
   - **Value Proposition (3–4 Cards):** Service & invoice tracking, automated oil and state inspection alerts, and real-time total cost of ownership visibility.
   - **Smart Redirection:** If an authenticated user visits `/` with an active JWT session, the system automatically redirects them to the dashboard (or provides a *"Go to My Garage"* button).

1. **My Garage (Main Dashboard)**
   - **Vehicle Cards:** Displays the user's vehicles with **custom uploaded vehicle photos** (or fallback silhouette vectors), make, model, license plate, and current odometer reading.
   - **Quick Odometer Update:** Inline "Update Mileage" button on each card for fast entry (e.g., advancing from `142,300 km` to `144,100 km`), immediately recalculating all mileage-dependent reminders.
   - **Alert Indicators & Circular Gauges:** Visual progress dials (e.g., *Oil Life remaining % / km* and *Days until Inspection countdown*).

2. **Vehicle Detail (Car Profile)**
   - Hero header featuring the vehicle photo, core technical specifications (VIN, engine code, power output, fuel type, model year), and photo upload controls.
   - Tabbed layout: **Service History**, **Reminders & Intervals**, **Costs & Analytics**, **Documents & Gallery**.

3. **Service History & Service Entry (Master-Detail)**
   - Rendered as a **vertical timeline** ordered chronologically (newest to oldest), featuring category badges, workshop names, and attachment thumbnails.
   - **"New Service Entry" Form:**
     - **Header Details:** Date, odometer reading at service, category (*Routine Maintenance / Repair / Inspection / Performance Tuning*), workshop name (or "Self-Service/DIY"), and technician notes.
     - **Line Items (Dynamic List):** Dynamic row builder with `+ Add Item` (e.g., *Engine Oil 5W-30 – €45*, *Oil Filter – €12*, *Labor – €30*). Totals auto-calculate in real time.
     - **Attachments (Drag & Drop):** PDF invoice and receipt uploads, and work photos. Images are automatically compressed in-browser before upload (reducing ~8 MB phone photos to ~200 KB).

4. **Reminders & Maintenance Intervals**
   - Three reminder types supported:
     1. **Date-only:** e.g., *Annual State Inspection (STK/MOT)*, *Highway Toll Sticker*, *Insurance Renewal*.
     2. **Mileage-only:** e.g., *Brake Pad Inspection every 20,000 km*.
     3. **Hybrid (Whichever occurs first):** e.g., *Engine Oil Change every 15,000 km OR 12 months*.
   - **Smart Service Linking:** When a user logs a service entry and marks an associated reminder as completed (e.g., *Engine Oil Change*), the reminder automatically advances to the next interval (`current_mileage + 15,000 km`, `service_date + 12 months`).

5. **Cost Statistics & Analytics (TCO – Total Cost of Ownership)**
   - **KPI Cards:** Total lifetime service expenditure, average monthly ownership cost, cost-per-kilometer, and total service visit count.
   - **Visualizations:** Monthly/annual cost breakdown bar charts and spending distribution by category.

---

## 2. Visual Identity & Color Palette (PitBox)

PitBox uses a targeted color palette engineered for high contrast, clean automotive service dashboards, and clear status communication:

| Token Name | Hex Code | Role / Usage |
| :--- | :--- | :--- |
| `pitbox-steel` | `#3368A0` | Primary brand accent, top navbar background, primary CTAs, active highlights |
| `pitbox-glacier` | `#66A3BF` | Secondary brand color, gauge indicators, chart series, secondary action icons |
| `pitbox-seafoam` | `#C8DFDB` | Soft panel backgrounds, card borders, timeline headers, status pill badges |
| `pitbox-cream` | `#F2EFE7` | Viewport base background canvas, warm neutral page fill |
| `pitbox-dark` | `#1C2E42` | Primary typography color, high-contrast headings, text labels |
| `white` | `#FFFFFF` | Elevated container cards, modals, popovers |

**Typography:** Standardized sans-serif font stack (`Inter`, `system-ui`, `-apple-system`, `sans-serif`) optimized for legibility across mobile and desktop viewports.

---

## 3. Database Architecture (PostgreSQL ER Diagram)

This schema supports built-in user management with stateless JWT authentication, vehicles with user photo storage paths, master-detail service records, file attachments, and automated recurring reminders.

```mermaid
erDiagram
    USERS ||--o{ VEHICLES : "owns"
    VEHICLES ||--o{ SERVICE_RECORDS : "has history"
    VEHICLES ||--o{ REMINDERS : "schedules"
    VEHICLES ||--o{ MILEAGE_LOGS : "logs odometer"
    SERVICE_RECORDS ||--|{ SERVICE_ITEMS : "contains"
    SERVICE_RECORDS ||--o{ ATTACHMENTS : "includes"

    USERS {
        uuid id PK
        string email UK "Login email"
        string password_hash "BCrypt hash"
        string full_name "Display name"
        string role "USER, ADMIN"
        timestamp created_at
    }

    VEHICLES {
        uuid id PK
        uuid user_id FK
        string manufacturer "Make (e.g., Skoda)"
        string model "Model (e.g., Octavia)"
        int manufacture_year
        string license_plate "License Plate"
        string vin "VIN (17 characters)"
        string engine_info "e.g., 2.0 TDI 110kW"
        string fuel_type "DIESEL, PETROL, EV, HYBRID"
        int current_mileage "Current odometer reading"
        string photo_path "Relative photo path (/uploads/vehicles/...)"
        timestamp created_at
    }

    MILEAGE_LOGS {
        uuid id PK
        uuid vehicle_id FK
        int mileage "Logged odometer reading"
        date recorded_at
        string source "MANUAL_DASHBOARD or SERVICE_RECORD"
    }

    SERVICE_RECORDS {
        uuid id PK
        uuid vehicle_id FK
        date service_date "Service date"
        int mileage_at_service "Odometer reading during service"
        string category "MAINTENANCE, REPAIR, INSPECTION, OTHER"
        string workshop_name "Workshop name or DIY"
        decimal total_cost "Sum of line item totals"
        text notes "Mechanic or owner notes"
        timestamp created_at
    }

    SERVICE_ITEMS {
        uuid id PK
        uuid service_record_id FK
        string name "Part or labor description"
        string item_type "PART, LABOR, FLUID"
        int quantity "Quantity"
        decimal unit_price "Unit price"
        decimal total_price "Total line price"
    }

    ATTACHMENTS {
        uuid id PK
        uuid service_record_id FK
        string file_name "Original file name"
        string storage_path "Relative volume path (/uploads/...)"
        string content_type "application/pdf, image/webp, image/jpeg"
        long file_size_bytes
        timestamp uploaded_at
    }

    REMINDERS {
        uuid id PK
        uuid vehicle_id FK
        string title "e.g., Engine Oil Change, Inspection"
        string reminder_type "MILEAGE, DATE, BOTH"
        int target_mileage "Target mileage threshold"
        date target_date "Target date threshold"
        int interval_mileage "Recurrence interval (km)"
        int interval_months "Recurrence interval (months)"
        boolean is_completed
    }
```

### Physical Database Migration (Flyway V1)
Implemented via Flyway migration [`V1__initial_schema.sql`](file:///C:/Users/brecka/source/repos/PitBox/backend/src/main/resources/db/migration/V1__initial_schema.sql):
- **Primary Keys:** UUID v4 default `gen_random_uuid()`.
- **Foreign Keys:** Cascading deletes (`ON DELETE CASCADE`) bound to parent records (`users`, `vehicles`, `service_records`).
- **Indexes:** Foreign key coverage on `idx_vehicles_user_id`, `idx_mileage_logs_vehicle_id`, `idx_service_records_vehicle_id`, `idx_service_items_record_id`, `idx_attachments_record_id`, and `idx_reminders_vehicle_id`.
- **Audit Fields:** `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`.

---

## 4. Lightweight Technology Stack (Zero-Cost, < 400 MB RAM for ~20 Users)

Eliminating heavyweight identity providers (Keycloak) and object stores (MinIO) reclaims over **1.2 GB of RAM**, allowing the entire system to run comfortably on low-resource home servers or free-tier cloud environments.

### Estimated RAM Footprint:

| Container / Service | Technology | RAM Allocation (~20 users) | Notes |
| :--- | :--- | :--- | :--- |
| **Database** | `postgres:16-alpine` | **~35 – 60 MB** | Extremely lightweight Alpine base |
| **Frontend + Web Server** | `nginx:alpine` (Static React build) | **~10 – 15 MB** | No Node.js runtime in production; compiled assets only |
| **Backend** | `Spring Boot 3` (Java 21 JRE Alpine) | **~220 – 300 MB** | Configured with `-Xmx256m` (or **~60 MB** via GraalVM Native Image) |
| **TOTAL SYSTEM** | **3 Lightweight Containers** | **~270 – 375 MB RAM** | Runs comfortably on a Raspberry Pi or low-spec VPS |

> [!TIP]
> **Zero-Cost Secure Remote Access:**
> Using a **Cloudflare Tunnel (`cloudflared`)** (~15 MB RAM) provides end-to-end HTTPS certificates, DDoS mitigation, and external access without exposing router ports or requiring a static public IP.

### Storage Flexibility:
File operations are decoupled behind a `FileStorageService` interface:
- **Local Self-Hosting:** `LocalFileStorageService` writes to a mounted Docker volume at `/app/uploads`.
- **Free Cloud Deployments:** Easily toggleable to S3-compatible alternatives like **Cloudflare R2** (10 GB free tier) or direct database persistence for compressed ~200 KB assets.

### Dependency Manifest:
- **Backend (Spring Boot 3 + Java 21):**
  - `Spring Security + jjwt`: Stateless JWT authentication and `BCryptPasswordEncoder`.
  - `Spring Data JPA + Flyway`: PostgreSQL persistence with incremental database migrations on startup.
  - `Spring Web + Validation`: REST API and request payload validation (`jakarta.validation`).
- **Frontend (React + TypeScript + Vite):**
  - `Tailwind CSS + shadcn/ui`: Themed to the PitBox brand palette (`#3368A0`, `#66A3BF`, `#C8DFDB`, `#F2EFE7`).
  - `browser-image-compression`: Client-side compression pipeline reducing 8 MB mobile photos to ~200 KB WebP/JPEG files prior to transport.
  - `TanStack Query (React Query)` + `Axios`: Server state management and automated caching.
  - `React Hook Form + Zod`: Dynamic schema-validated forms.
  - `Recharts`: Composable expense analytics charts.

### Environment Configuration & Secrets Matrix:

System parameters are externalized in `.env` (template in [`.env.example`](file:///C:/Users/brecka/source/repos/PitBox/.env.example)) and injected via [`docker-compose.yml`](file:///C:/Users/brecka/source/repos/PitBox/docker-compose.yml):

| Variable | Default / Example | Target Container | Purpose |
| :--- | :--- | :--- | :--- |
| `POSTGRES_DB` | `pitbox` | `postgres`, `backend` | PostgreSQL database name |
| `POSTGRES_USER` | `pitbox` | `postgres`, `backend` | PostgreSQL database user |
| `POSTGRES_PASSWORD` | `pitbox_secure_password_change_me` | `postgres`, `backend` | PostgreSQL database password |
| `POSTGRES_PORT` | `5432` | `postgres` (host) | External host port mapping |
| `BACKEND_PORT` | `8080` | `backend` (host) | External host port mapping for Spring Boot |
| `FRONTEND_PORT` | `80` | `frontend` (host) | External host port mapping for Nginx |
| `JWT_SECRET` | `404E63...` (256-bit min) | `backend` | HMAC-SHA secret for stateless JWT signing |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | `backend` | Access token lifespan in milliseconds |
| `UPLOAD_DIR` | `/app/uploads` | `backend` | Filesystem upload directory path |
| `JAVA_OPTS` | `-Xms64m -Xmx256m -XX:+UseG1GC` | `backend` | JRE memory & GC tuning enforcing < 400 MB RAM budget |

---

## 5. Domain Rules & Core Invariants

1. **Odometer Forward-Only Invariance:**
   - If a vehicle currently has an odometer reading of `150,000 km` and the user logs a service dated today at `152,400 km`, the backend updates `vehicle.current_mileage = 152400` and creates an audit entry in `MILEAGE_LOGS`.
   - If a user retroactively logs a past invoice from last year (e.g., at `130,000 km`), `vehicle.current_mileage` remains untouched at `152,400 km`.
2. **Reminder Threshold Engine:**
   - Dynamic reminder evaluations calculate remaining units and statuses:
     - `OVERDUE` (Red): `current_mileage >= target_mileage` OR `current_date >= target_date`.
     - `DUE_SOON` (Amber): `target_mileage - current_mileage <= 1,000 km` OR `target_date - current_date <= 30 days`.
     - `OK` (Green/Blue): Default valid status.
3. **Multi-Tenant Isolation:**
   - Every API query resolves `user_id` strictly from the authenticated JWT `SecurityContextHolder`. Cross-tenant data access attempts return `403 Forbidden`.

---

## 6. Implementation Roadmap

1. **Step 1 – Foundations & Environment:** `[COMPLETED]`
   - Configured [`docker-compose.yml`](file:///C:/Users/brecka/source/repos/PitBox/docker-compose.yml) orchestrating `postgres:16-alpine`, `pitbox-backend` (Spring Boot 3.3.5), and `pitbox-frontend` (Nginx + React 18).
   - Applied Flyway migration [`V1__initial_schema.sql`](file:///C:/Users/brecka/source/repos/PitBox/backend/src/main/resources/db/migration/V1__initial_schema.sql) defining relational schema with UUIDs, cascade constraints, and indexes.
   - Externalized configuration to [`.env.example`](file:///C:/Users/brecka/source/repos/PitBox/.env.example) and parameterized memory limits (`JAVA_OPTS: -Xmx256m`, Docker memory limits).
   - Implemented public health endpoint [`/api/health`](file:///C:/Users/brecka/source/repos/PitBox/backend/src/main/java/com/pitbox/controller/HealthController.java) and stateless [`SecurityConfig`](file:///C:/Users/brecka/source/repos/PitBox/backend/src/main/java/com/pitbox/config/SecurityConfig.java) baseline.
   - Built React frontend scaffolding with Tailwind tokens (`#3368A0`, `#66A3BF`, `#C8DFDB`, `#F2EFE7`, `#1C2E42`) and Vitest test harness.
2. **Step 2 – Public Landing Page & JWT Auth:** Implement unauthenticated landing screen (`/`), authentication routes (`/login`, `/register`), and token-protected private route guards.
3. **Step 3 – Garage & Vehicle Management:** Vehicle CRUD endpoints, client-side photo compression, profile image uploads, and quick odometer updates.
4. **Step 4 – Service Records (Master-Detail):** Dynamic line-item entry form, cost calculation, service category filtering, and odometer auto-advance logic.
5. **Step 5 – File Attachments & Gallery:** Multi-file upload handlers, local volume persistence via `FileStorageService`, and timeline attachment previews.
6. **Step 6 – Reminders, Gauges, & Analytics:** Dynamic interval calculation engines, SVG progress gauges (Oil Life, STK inspection), and Recharts expense visualizers.

---

## 7. Implemented API Contracts & Baseline Services

### 7.1 Health Check API
- **Endpoint:** `GET /api/health`
- **Class:** [`HealthController`](file:///C:/Users/brecka/source/repos/PitBox/backend/src/main/java/com/pitbox/controller/HealthController.java)
- **Access:** Public (whitelisted in `SecurityConfig`)
- **Response Status:** `200 OK`
- **Response Schema:**
  ```json
  {
    "status": "UP",
    "service": "pitbox-backend"
  }
  ```
- **Consumer:** Frontend boot check ([`App.tsx`](file:///C:/Users/brecka/source/repos/PitBox/frontend/src/App.tsx)) and container orchestration probes.

### 7.2 Security Baseline
- **Configuration:** [`SecurityConfig`](file:///C:/Users/brecka/source/repos/PitBox/backend/src/main/java/com/pitbox/config/SecurityConfig.java)
- **Session Policy:** `SessionCreationPolicy.STATELESS` (stateless JWT).
- **Protection:** CSRF disabled, CORS pre-flight permitted with credentials.
- **Route Authorization:**
  - Whitelisted: `/api/health`, `/api/auth/**` (permitAll).
  - Authenticated: All other endpoints require valid Bearer token.
- **Password Encoder:** `BCryptPasswordEncoder` bean.

### 7.3 Frontend Reverse Proxy
- **Configuration:** [`frontend/nginx.conf`](file:///C:/Users/brecka/source/repos/PitBox/frontend/nginx.conf)
- **SPA Fallback:** `try_files $uri $uri/ /index.html` with gzip compression level 6.
- **Reverse Proxy Routing:**
  - `/api/` ➔ `http://backend:8080/api/` (Preserving host and real IP headers).
  - `/uploads/` ➔ `http://backend:8080/uploads/` (Serving uploaded receipts and vehicle photos).