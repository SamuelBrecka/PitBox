package com.pitbox.dto;

import com.pitbox.model.Attachment;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class AttachmentResponse {

    private UUID id;
    private UUID serviceRecordId;
    private String fileName;
    private String storagePath;
    private String contentType;
    private Long fileSizeBytes;
    private Instant uploadedAt;

    public AttachmentResponse() {
    }

    public static AttachmentResponse fromEntity(Attachment attachment) {
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setServiceRecordId(attachment.getServiceRecord() != null ? attachment.getServiceRecord().getId() : null);
        response.setFileName(attachment.getFileName());
        response.setStoragePath(attachment.getStoragePath());
        response.setContentType(attachment.getContentType());
        response.setFileSizeBytes(attachment.getFileSizeBytes());
        response.setUploadedAt(attachment.getUploadedAt());
        return response;
    }
}
