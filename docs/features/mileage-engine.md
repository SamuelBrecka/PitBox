# PitBox Mileage Engine Specification

## 1. Domain Overview
The PitBox Mileage Engine enforces the forward-only odometer reading invariant across the vehicle lifecycle and maintains an immutable audit trail in `MILEAGE_LOGS`.

## 2. Core Invariants & Rules

1. **Forward-Only Odometer Progression:**
   - Any manual odometer adjustment updates `VEHICLES.current_mileage` if and only if `new_reading > current_mileage`.
   - If `new_reading <= current_mileage`, the server rejects the request with HTTP `400 Bad Request` and message `"New mileage must be greater than current mileage"`.
2. **Audit Logging (`MILEAGE_LOGS`):**
   - Every odometer update (manual or future service records) appends an immutable audit entry to `mileage_logs` with:
     - `id`: UUID v4
     - `vehicle_id`: UUID of the target vehicle
     - `mileage`: integer odometer value
     - `recorded_at`: ISO date (`LocalDate.now()`)
     - `source`: `"MANUAL_DASHBOARD"` (or `"SERVICE_RECORD"` in Step 4)
3. **Tenant Boundary:**
   - Vehicle lookups and updates verify `vehicle.user_id == authenticated_user_id`. Non-matching IDs yield `404 Not Found`.

## 3. Endpoints

- `PATCH /api/vehicles/{id}/mileage`
  - Body: `{ "mileage": 155000 }`
  - Response: `VehicleResponse` with updated `currentMileage`.
  - Audits to `mileage_logs`.
- `GET /api/vehicles/{id}/mileage-logs`
  - Response: `List<MileageLogResponse>` sorted by `recorded_at DESC, mileage DESC`.
