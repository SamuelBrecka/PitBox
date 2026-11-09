package com.pitbox.service;

import com.pitbox.dto.AttachmentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface AttachmentService {

    List<AttachmentResponse> uploadAttachments(UUID vehicleId, UUID serviceRecordId, MultipartFile[] files, UUID userId);

    List<AttachmentResponse> getAttachmentsByRecord(UUID vehicleId, UUID serviceRecordId, UUID userId);

    List<AttachmentResponse> getAttachmentsByVehicle(UUID vehicleId, UUID userId);

    void deleteAttachment(UUID vehicleId, UUID serviceRecordId, UUID attachmentId, UUID userId);
}
