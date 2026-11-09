package com.pitbox.service;

import com.pitbox.dto.AttachmentResponse;
import com.pitbox.exception.ResourceNotFoundException;
import com.pitbox.model.Attachment;
import com.pitbox.model.ServiceRecord;
import com.pitbox.repository.AttachmentRepository;
import com.pitbox.repository.ServiceRecordRepository;
import com.pitbox.repository.VehicleRepository;
import com.pitbox.service.storage.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final ServiceRecordRepository serviceRecordRepository;
    private final VehicleRepository vehicleRepository;
    private final FileStorageService fileStorageService;

    public AttachmentServiceImpl(AttachmentRepository attachmentRepository,
                                 ServiceRecordRepository serviceRecordRepository,
                                 VehicleRepository vehicleRepository,
                                 FileStorageService fileStorageService) {
        this.attachmentRepository = attachmentRepository;
        this.serviceRecordRepository = serviceRecordRepository;
        this.vehicleRepository = vehicleRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<AttachmentResponse> uploadAttachments(UUID vehicleId, UUID serviceRecordId, MultipartFile[] files, UUID userId) {
        verifyVehicleOwnership(vehicleId, userId);
        ServiceRecord serviceRecord = serviceRecordRepository.findByIdAndVehicleId(serviceRecordId, vehicleId)
            .orElseThrow(() -> new ResourceNotFoundException("Service record not found"));

        if (files == null || files.length == 0) {
            return List.of();
        }

        List<Attachment> savedAttachments = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String storagePath = fileStorageService.storeFile(file, "attachments");
            String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment";
            String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

            Attachment attachment = new Attachment();
            attachment.setServiceRecord(serviceRecord);
            attachment.setFileName(originalFileName);
            attachment.setStoragePath(storagePath);
            attachment.setContentType(contentType);
            attachment.setFileSizeBytes(file.getSize());

            serviceRecord.addAttachment(attachment);
            savedAttachments.add(attachmentRepository.save(attachment));
        }

        return savedAttachments.stream()
            .map(AttachmentResponse::fromEntity)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByRecord(UUID vehicleId, UUID serviceRecordId, UUID userId) {
        verifyVehicleOwnership(vehicleId, userId);
        serviceRecordRepository.findByIdAndVehicleId(serviceRecordId, vehicleId)
            .orElseThrow(() -> new ResourceNotFoundException("Service record not found"));

        return attachmentRepository.findByServiceRecordIdOrderByUploadedAtDesc(serviceRecordId)
            .stream()
            .map(AttachmentResponse::fromEntity)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByVehicle(UUID vehicleId, UUID userId) {
        verifyVehicleOwnership(vehicleId, userId);
        return attachmentRepository.findAllByVehicleId(vehicleId)
            .stream()
            .map(AttachmentResponse::fromEntity)
            .toList();
    }

    @Override
    public void deleteAttachment(UUID vehicleId, UUID serviceRecordId, UUID attachmentId, UUID userId) {
        verifyVehicleOwnership(vehicleId, userId);
        ServiceRecord record = serviceRecordRepository.findByIdAndVehicleId(serviceRecordId, vehicleId)
            .orElseThrow(() -> new ResourceNotFoundException("Service record not found"));

        Attachment attachment = attachmentRepository.findByIdAndServiceRecordId(attachmentId, serviceRecordId)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));

        fileStorageService.deleteFile(attachment.getStoragePath());
        record.removeAttachment(attachment);
        attachmentRepository.delete(attachment);
    }

    private void verifyVehicleOwnership(UUID vehicleId, UUID userId) {
        vehicleRepository.findByIdAndUserId(vehicleId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
    }
}
