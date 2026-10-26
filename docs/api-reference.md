# PitBox REST API Reference

All requests requiring authentication must include the HTTP header:
`Authorization: Bearer <jwt-token>`

## 1. Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register`: Register user account and return JWT.
- `POST /api/auth/login`: Authenticate credentials and return JWT.
- `GET /api/auth/me`: Fetch authenticated user profile.

---

## 2. Vehicle Management Endpoints (`/api/vehicles`)

### 2.1 List Vehicles
- **Method & Path:** `GET /api/vehicles`
- **Security:** Bearer Token required. Scoped to authenticated user.
- **Response:** `200 OK`
```json
[
  {
    "id": "e814a6ec-07b9-4a94-b159-fdf870f7236d",
    "manufacturer": "Skoda",
    "model": "Octavia",
    "manufactureYear": 2019,
    "licensePlate": "BA-123XY",
    "vin": "TMBJH7NE0K0000000",
    "engineInfo": "2.0 TDI 110 kW",
    "fuelType": "DIESEL",
    "currentMileage": 145000,
    "photoPath": "/uploads/vehicles/photo_123.webp",
    "createdAt": "2026-10-26T18:00:00Z"
  }
]
```

### 2.2 Get Vehicle by ID
- **Method & Path:** `GET /api/vehicles/{id}`
- **Security:** Bearer Token required. Must belong to authenticated user (or `404 Not Found`).
- **Response:** `200 OK` (Single `VehicleResponse` JSON).

### 2.3 Create Vehicle
- **Method & Path:** `POST /api/vehicles`
- **Security:** Bearer Token required.
- **Request Body:**
```json
{
  "manufacturer": "Skoda",
  "model": "Octavia",
  "manufactureYear": 2019,
  "licensePlate": "BA-123XY",
  "vin": "TMBJH7NE0K0000000",
  "engineInfo": "2.0 TDI 110 kW",
  "fuelType": "DIESEL",
  "currentMileage": 145000
}
```
- **Constraints:**
  - `manufacturer`: `@NotBlank`, max 100
  - `model`: `@NotBlank`, max 100
  - `manufactureYear`: `@NotNull`, `@Min(1900)`, `@Max(2100)`
  - `licensePlate`: `@NotBlank`, max 30
  - `fuelType`: `@NotBlank` (must be `PETROL`, `DIESEL`, `EV`, or `HYBRID`)
  - `currentMileage`: `@NotNull`, `@Min(0)`
- **Response:** `201 Created`

### 2.4 Update Vehicle
- **Method & Path:** `PUT /api/vehicles/{id}`
- **Security:** Bearer Token required. Must belong to authenticated user.
- **Request Body:**
```json
{
  "manufacturer": "Skoda",
  "model": "Octavia RS",
  "manufactureYear": 2019,
  "licensePlate": "BA-999ZZ",
  "vin": "TMBJH7NE0K0000000",
  "engineInfo": "2.0 TDI 135 kW",
  "fuelType": "DIESEL"
}
```
- **Response:** `200 OK`

### 2.5 Delete Vehicle
- **Method & Path:** `DELETE /api/vehicles/{id}`
- **Security:** Bearer Token required. Must belong to authenticated user.
- **Response:** `204 No Content`

### 2.6 Quick Odometer Update
- **Method & Path:** `PATCH /api/vehicles/{id}/mileage`
- **Security:** Bearer Token required. Must belong to authenticated user.
- **Request Body:**
```json
{
  "mileage": 148500
}
```
- **Rule:** `mileage` must be greater than current vehicle mileage (`mileage > currentMileage`). Otherwise returns `400 Bad Request`.
- **Response:** `200 OK` (Updated `VehicleResponse`).

### 2.7 Upload Vehicle Photo
- **Method & Path:** `POST /api/vehicles/{id}/photo`
- **Content-Type:** `multipart/form-data`
- **Security:** Bearer Token required. Must belong to authenticated user.
- **Part:** `file` (image file, compressed client-side).
- **Response:** `200 OK` (Updated `VehicleResponse` with `photoPath`).

### 2.8 Delete Vehicle Photo
- **Method & Path:** `DELETE /api/vehicles/{id}/photo`
- **Security:** Bearer Token required. Must belong to authenticated user.
- **Response:** `200 OK` (Updated `VehicleResponse` with `photoPath: null`).

### 2.9 Get Mileage Logs for Vehicle
- **Method & Path:** `GET /api/vehicles/{id}/mileage-logs`
- **Security:** Bearer Token required. Must belong to authenticated user.
- **Response:** `200 OK` (List of `MileageLogResponse` objects).
