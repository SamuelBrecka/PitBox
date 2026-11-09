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

---

## 3. Service Record Endpoints (`/api/vehicles/{vehicleId}/service-records`)

### 3.1 List Service Records
- **Method & Path:** `GET /api/vehicles/{vehicleId}/service-records`
- **Query Params:** `category` (optional: `MAINTENANCE`, `REPAIR`, `INSPECTION`, `OTHER`)
- **Security:** Bearer Token required. Vehicle must belong to authenticated user.
- **Response:** `200 OK` (List of `ServiceRecordResponse` sorted by `serviceDate DESC, createdAt DESC`).

### 3.2 Get Service Record by ID
- **Method & Path:** `GET /api/vehicles/{vehicleId}/service-records/{recordId}`
- **Security:** Bearer Token required.
- **Response:** `200 OK` (`ServiceRecordResponse`).

### 3.3 Create Service Record
- **Method & Path:** `POST /api/vehicles/{vehicleId}/service-records`
- **Security:** Bearer Token required.
- **Request Body:**
```json
{
  "serviceDate": "2026-10-20",
  "mileageAtService": 152400,
  "category": "MAINTENANCE",
  "workshopName": "PitStop Auto",
  "notes": "Annual oil and filter service",
  "items": [
    {
      "name": "Engine Oil 5W-30 (5L)",
      "itemType": "FLUID",
      "quantity": 1,
      "unitPrice": 45.50
    },
    {
      "name": "Mechanic Labor",
      "itemType": "LABOR",
      "quantity": 2,
      "unitPrice": 30.00
    }
  ]
}
```
- **Domain Rules:**
  - Server calculates each item's `totalPrice = quantity * unitPrice` and record's `totalCost`.
  - If `mileageAtService > vehicle.currentMileage`, `vehicle.currentMileage` is automatically advanced and an audit entry (`source: "SERVICE_RECORD"`) is appended to `mileage_logs`.
- **Response:** `201 Created` (`ServiceRecordResponse`).

### 3.4 Update Service Record
- **Method & Path:** `PUT /api/vehicles/{vehicleId}/service-records/{recordId}`
- **Security:** Bearer Token required.
- **Request Body:** Same as Create (`CreateServiceRecordRequest`).
- **Response:** `200 OK` (`ServiceRecordResponse`).

### 3.5 Delete Service Record
- **Method & Path:** `DELETE /api/vehicles/{vehicleId}/service-records/{recordId}`
- **Security:** Bearer Token required.
- **Response:** `204 No Content`. Deletes database record and cascades deletion of attached physical files from storage.

---

## 4. File Attachment Endpoints (`/api/vehicles/{vehicleId}/service-records/{recordId}/attachments`)

### 4.1 Upload Attachments
- **Method & Path:** `POST /api/vehicles/{vehicleId}/service-records/{recordId}/attachments`
- **Security:** Bearer Token required. Vehicle must belong to authenticated user.
- **Content-Type:** `multipart/form-data`
- **Form Param:** `files` (array of `MultipartFile`)
- **Allowed Types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`
- **Response:** `201 Created`
```json
[
  {
    "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "serviceRecordId": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "fileName": "faktura_servis.pdf",
    "storagePath": "/uploads/attachments/uuid.pdf",
    "contentType": "application/pdf",
    "fileSizeBytes": 204800,
    "uploadedAt": "2026-10-26T18:30:00Z"
  }
]
```

### 4.2 List Attachments for Service Record
- **Method & Path:** `GET /api/vehicles/{vehicleId}/service-records/{recordId}/attachments`
- **Security:** Bearer Token required.
- **Response:** `200 OK` (Array of `AttachmentResponse` objects).

### 4.3 List All Attachments for Vehicle
- **Method & Path:** `GET /api/vehicles/{vehicleId}/attachments`
- **Security:** Bearer Token required. Backs the "Dokumenty a galéria" tab.
- **Response:** `200 OK` (Array of `AttachmentResponse` objects ordered by `uploadedAt DESC`).

### 4.4 Delete Attachment
- **Method & Path:** `DELETE /api/vehicles/{vehicleId}/service-records/{recordId}/attachments/{attachmentId}`
- **Security:** Bearer Token required.
- **Response:** `204 No Content`. Purges physical file from storage disk.

