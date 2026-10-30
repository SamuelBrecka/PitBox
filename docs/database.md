# PitBox Database & Migrations Reference

## 1. Overview
PitBox uses **PostgreSQL 16** with forward-only **Flyway migrations**.
All tables use UUID v4 primary keys (`gen_random_uuid()`), cascading foreign keys, and explicit foreign key indexes.

## 2. Table Definitions (Vehicles & Mileage Logs)

### `vehicles`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique vehicle identifier |
| `user_id` | `UUID` | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` | Owner user ID (multi-tenant boundary) |
| `manufacturer` | `VARCHAR(100)` | `NOT NULL` | Vehicle make (e.g. Skoda, BMW) |
| `model` | `VARCHAR(100)` | `NOT NULL` | Model name (e.g. Octavia, 3 Series) |
| `manufacture_year` | `INT` | `NOT NULL` | Year of manufacture |
| `license_plate` | `VARCHAR(30)` | `NOT NULL` | Registration number / plate |
| `vin` | `VARCHAR(17)` | `NULL` | 17-character VIN identifier |
| `engine_info` | `VARCHAR(100)` | `NULL` | Engine displacement/code (e.g. 2.0 TDI) |
| `fuel_type` | `VARCHAR(30)` | `NOT NULL` | Fuel type (`PETROL`, `DIESEL`, `EV`, `HYBRID`) |
| `current_mileage` | `INT` | `NOT NULL DEFAULT 0` | Latest verified odometer reading (km) |
| `photo_path` | `VARCHAR(500)` | `NULL` | Relative uploaded photo path |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Creation timestamp |

**Indexes:**
- `idx_vehicles_user_id` ON `vehicles(user_id)`

---

### `mileage_logs`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique log identifier |
| `vehicle_id` | `UUID` | `NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE` | Associated vehicle |
| `mileage` | `INT` | `NOT NULL` | Odometer reading at time of logging |
| `recorded_at` | `DATE` | `NOT NULL` | Date logged |
| `source` | `VARCHAR(50)` | `NOT NULL` | Source (`MANUAL_DASHBOARD`, `SERVICE_RECORD`) |

**Indexes:**
- `idx_mileage_logs_vehicle_id` ON `mileage_logs(vehicle_id)`

---

## 3. Flyway Migrations History
- `V1__initial_schema.sql`: Initial tables creation (`users`, `vehicles`, `mileage_logs`, `service_records`, `service_items`, `attachments`, `reminders`).
- `V2__seed_default_users.sql`: Seed default user (`user@pitbox.io`, `ROLE_USER`) and admin user (`admin@pitbox.io`, `ROLE_ADMIN`) with BCrypt-hashed passwords.

---

## 4. Default Seeded Users
On database build or rebuild, the following accounts are automatically seeded:

| Account | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Default User** | `user@pitbox.io` | `password123` | `ROLE_USER` | Standard vehicle owner tenant account |
| **Admin User** | `admin@pitbox.io` | `admin123` | `ROLE_ADMIN` | Reserved administrative user account |
