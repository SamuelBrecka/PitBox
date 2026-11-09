package com.pitbox.controller;

import com.pitbox.dto.AttachmentResponse;
import com.pitbox.security.UserPrincipal;
import com.pitbox.service.AttachmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles/{vehicleId}")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(value = "/service-records/{recordId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<AttachmentResponse>> uploadAttachments(
            @PathVariable UUID vehicleId,
            @PathVariable UUID recordId,
            @RequestParam("files") MultipartFile[] files,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AttachmentResponse> responses = attachmentService.uploadAttachments(vehicleId, recordId, files, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @GetMapping("/service-records/{recordId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachmentsByRecord(
            @PathVariable UUID vehicleId,
            @PathVariable UUID recordId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AttachmentResponse> responses = attachmentService.getAttachmentsByRecord(vehicleId, recordId, principal.getId());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachmentsByVehicle(
            @PathVariable UUID vehicleId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AttachmentResponse> responses = attachmentService.getAttachmentsByVehicle(vehicleId, principal.getId());
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/service-records/{recordId}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID vehicleId,
            @PathVariable UUID recordId,
            @PathVariable UUID attachmentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        attachmentService.deleteAttachment(vehicleId, recordId, attachmentId, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
