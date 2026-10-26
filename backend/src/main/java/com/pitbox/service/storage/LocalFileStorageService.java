package com.pitbox.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
        "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final Path rootLocation;

    public LocalFileStorageService(@Value("${pitbox.storage.upload-dir:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize storage directory at " + rootLocation, e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file type: " + contentType + ". Allowed: JPEG, PNG, WEBP, GIF");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "photo.jpg"));
        if (originalFilename.contains("..")) {
            throw new IllegalArgumentException("Cannot store file with relative path sequence: " + originalFilename);
        }

        // Clean extension
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String sanitizedSubDirectory = StringUtils.cleanPath(subDirectory).replace("..", "").replaceAll("^/+", "");
        Path targetDir = this.rootLocation.resolve(sanitizedSubDirectory).normalize();

        try {
            Files.createDirectories(targetDir);
            String storedFileName = UUID.randomUUID() + extension;
            Path destinationFile = targetDir.resolve(storedFileName).normalize();

            if (!destinationFile.startsWith(this.rootLocation)) {
                throw new SecurityException("Cannot store file outside current storage directory");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/" + sanitizedSubDirectory + "/" + storedFileName;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file", e);
        }
    }

    @Override
    public void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        String cleaned = relativePath.startsWith("/uploads/") ? relativePath.substring("/uploads/".length()) : relativePath;
        Path targetFile = this.rootLocation.resolve(cleaned).normalize();

        if (targetFile.startsWith(this.rootLocation)) {
            try {
                Files.deleteIfExists(targetFile);
            } catch (IOException ignored) {
                // Ignore failure on best-effort cleanup
            }
        }
    }
}
