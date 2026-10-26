# PitBox Media & Storage Subsystem Specification

## 1. Overview
PitBox keeps memory footprint under 400 MB and avoids heavy object store infrastructure by combining **client-side image compression** with an abstracted backend **`FileStorageService`**.

## 2. Invariants & Storage Architecture

1. **Client-Side Image Compression:**
   - Raw photos captured on smartphones (often 5–12 MB) are compressed in the browser using `browser-image-compression`.
   - Compression target: max file size `0.2 MB` (~200 KB), max dimension `1920x1080` (or `1280x720` for vehicle avatars), WebP or JPEG output.
   - Prevents backend out-of-memory errors on `-Xmx256m` low-RAM JVM.
2. **`FileStorageService` Abstraction:**
   ```java
   public interface FileStorageService {
       String storeFile(MultipartFile file, String subDirectory);
       void deleteFile(String storagePath);
   }
   ```
   - Default implementation: `LocalFileStorageService`.
   - Target directory: `${pitbox.storage.upload-dir:./uploads}` (mapped to Docker volume `/app/uploads`).
   - File naming: Sanitized UUID prefix (`UUID.randomUUID() + "_" + sanitizedFilename`).
3. **Serving Uploads:**
   - Handled via Spring WebMvc resource handlers mapping `/uploads/**` to `file:${pitbox.storage.upload-dir}/`.
   - In production, Nginx reverse proxies `/uploads/*` directly to the backend or serves from static volume mount.
4. **Tenant & Data Isolation:**
   - Only the authenticated owner of a vehicle can upload or delete vehicle photos.
   - Replacing or deleting a vehicle photo purges the obsolete file from disk.

## 3. Endpoints

- `POST /api/vehicles/{id}/photo`: `multipart/form-data` with `file`.
- `DELETE /api/vehicles/{id}/photo`: Purges the photo and sets `photo_path` to null.
