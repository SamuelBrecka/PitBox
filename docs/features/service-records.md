# PitBox Service Records (Master-Detail) Specification

## 1. Domain Overview
The Service Records subsystem provides a complete master-detail service logbook (`service_records` and `service_items`) for each vehicle, supporting dynamic line-item breakdowns (parts, fluids, labor), server-side financial aggregation, category filtering, and automated forward-only odometer synchronization.

## 2. Core Invariants & Business Rules

1. **Master-Detail Atomic Persistence:**
   - Every service record (`SERVICE_RECORDS`) must contain at least one line item (`SERVICE_ITEMS`).
   - Line items are classified by `item_type`: `PART`, `LABOR`, or `FLUID`.
   - Updating a service record replaces its child line items via JPA `orphanRemoval = true`.
2. **Server-Side Cost Calculation:**
   - Each line item computes `total_price = round(quantity * unit_price, 2)`.
   - The parent record computes `total_cost = sum(items.total_price)` using `BigDecimal` (`HALF_UP`, scale 2). Client-supplied totals are never trusted.
3. **Odometer Auto-Advance & Retroactive Entries:**
   - If `mileage_at_service > vehicle.current_mileage`:
     - Automatically updates `vehicle.current_mileage = mileage_at_service`.
     - Appends an immutable audit entry in `mileage_logs` with `source = "SERVICE_RECORD"` and `recorded_at = service_date`.
   - If `mileage_at_service <= vehicle.current_mileage` (e.g. logging a historical invoice from a previous year):
     - The service record is saved at its historical mileage without reducing `vehicle.current_mileage`.
4. **Category Filtering:**
   - Supported categories: `MAINTENANCE`, `REPAIR`, `INSPECTION`, `OTHER`.
   - `GET /api/vehicles/{vehicleId}/service-records?category={CATEGORY}` filters chronologically (`service_date DESC, created_at DESC`).
5. **Tenant Isolation:**
   - Every operation verifies `vehicle.user_id == authenticated_user_id` from the JWT `SecurityContextHolder`. Cross-tenant access yields `404 Not Found`.

## 3. REST Endpoints
- `GET /api/vehicles/{vehicleId}/service-records` (optional `?category=MAINTENANCE|REPAIR|INSPECTION|OTHER`)
- `GET /api/vehicles/{vehicleId}/service-records/{recordId}`
- `POST /api/vehicles/{vehicleId}/service-records`
- `PUT /api/vehicles/{vehicleId}/service-records/{recordId}`
- `DELETE /api/vehicles/{vehicleId}/service-records/{recordId}`
