package com.pitbox.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /**
     * Stores an uploaded multipart file in the specified subdirectory.
     *
     * @param file the multipart file to store
     * @param subDirectory target folder under the storage root (e.g. "vehicles")
     * @return the relative URL path for accessing the file (e.g. "/uploads/vehicles/xyz.webp")
     */
    String storeFile(MultipartFile file, String subDirectory);

    /**
     * Deletes a file given its relative URL path.
     *
     * @param relativePath the path returned by storeFile (e.g. "/uploads/vehicles/xyz.webp")
     */
    void deleteFile(String relativePath);
}
