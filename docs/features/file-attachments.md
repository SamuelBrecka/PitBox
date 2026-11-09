# PitBox File Attachments & Gallery Subsystem Specification

## 1. Overview
PitBox provides multi-file attachment capabilities for service records and vehicles, enabling owners to upload and organize workshop invoices, state inspection protocols (STK / EK), parts receipts, and repair photos.
The subsystem adheres to PitBox's strict memory budget (< 400 MB RAM) by utilizing **in-browser image compression** before upload, streaming file persistence directly to disk, and abstracting storage operations behind `FileStorageService`.

---

## 2. Invariants & Storage Architecture

1. **Client-Side Compression (`browser-image-compression`):**
   - Service invoice and workshop photos captured on smartphones (often 4–12 MB) are compressed in the browser before transmission.
   - Compression target: max file size `0.8 MB`, max dimension `1920x1920`, WebP/JPEG format.
   - PDFs are detected and streamed uncompressed to prevent corruption of vector document data.
2. **Storage Decoupling (`FileStorageService`):**
   - Upload target directory: `${pitbox.storage.upload-dir:./uploads}/attachments`.
   - File naming: Cryptographic UUID prefix with sanitized file extension (`UUID.randomUUID() + extension`).
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf`.
3. **Physical File Lifecycle & Orphan Prevention:**
   - Single attachment deletion purges the physical file from disk via `FileStorageService.deleteFile(storagePath)`.
   - Cascade deletion on service record deletion iterates all linked attachments and removes their files from disk before deleting the parent database record.
4. **Tenant Security Boundary:**
   - All attachment upload, query, and delete operations resolve and enforce user ownership through the authenticated JWT context (`SecurityContextHolder`).
   - Cross-tenant access attempts return HTTP `404 Not Found`.

---

## 3. Database Mapping (`ATTACHMENTS`)

Schema defined in Flyway migration [`V1__initial_schema.sql`](file:///C:/Users/brecka/source/repos/PitBox/backend/src/main/resources/db/migration/V1__initial_schema.sql):

```sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_record_id UUID NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_record_id ON attachments(service_record_id);
```

---

## 4. REST API Endpoints

| HTTP Method & Path | Controller Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST /api/vehicles/{vehicleId}/service-records/{recordId}/attachments` | `AttachmentController.uploadAttachments` | Authenticated Owner | Uploads 1 or more files to a service record (`multipart/form-data`) |
| `GET /api/vehicles/{vehicleId}/service-records/{recordId}/attachments` | `AttachmentController.getAttachmentsByRecord` | Authenticated Owner | Lists all attachments for a specific service record |
| `GET /api/vehicles/{vehicleId}/attachments` | `AttachmentController.getAttachmentsByVehicle` | Authenticated Owner | Lists all attachments across all service records for a vehicle |
| `DELETE /api/vehicles/{vehicleId}/service-records/{recordId}/attachments/{attachmentId}` | `AttachmentController.deleteAttachment` | Authenticated Owner | Deletes attachment and removes file from disk storage |

---

## 5. Frontend Components

- **[`AttachmentLightbox.tsx`](file:///C:/Users/brecka/source/repos/PitBox/frontend/src/components/AttachmentLightbox.tsx):** Fullscreen responsive media lightbox with keyboard navigation (`Esc`, `ArrowLeft`, `ArrowRight`), direct file download action, and PDF preview cards.
- **[`UploadAttachmentModal.tsx`](file:///C:/Users/brecka/source/repos/PitBox/frontend/src/components/UploadAttachmentModal.tsx):** Direct upload modal accessible from the "Dokumenty a galéria" tab, enabling multi-file selection, client-side compression status, and service record assignment.
- **[`ServiceRecordModal.tsx`](file:///C:/Users/brecka/source/repos/PitBox/frontend/src/components/ServiceRecordModal.tsx):** Built-in drag-and-drop dropzone, queued file management, and existing attachment removal during service record creation or editing.
- **[`VehicleDetailPage.tsx`](file:///C:/Users/brecka/source/repos/PitBox/frontend/src/pages/VehicleDetailPage.tsx):** Displays inline attachment previews in the Service History timeline and aggregates all vehicle attachments in the dedicated "Dokumenty a galéria" tab with filtering (`Všetko`, `Fotografie`, `Faktúry a dokumenty (PDF)`).
