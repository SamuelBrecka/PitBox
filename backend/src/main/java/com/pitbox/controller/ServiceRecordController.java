package com.pitbox.controller;

import com.pitbox.dto.CreateServiceRecordRequest;
import com.pitbox.dto.ServiceRecordResponse;
import com.pitbox.security.UserPrincipal;
import com.pitbox.service.ServiceRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles/{vehicleId}/service-records")
public class ServiceRecordController {

    private final ServiceRecordService serviceRecordService;

    public ServiceRecordController(ServiceRecordService serviceRecordService) {
        this.serviceRecordService = serviceRecordService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceRecordResponse>> getServiceRecords(
            @PathVariable UUID vehicleId,
            @RequestParam(required = false) String category,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ServiceRecordResponse> records = serviceRecordService.getServiceRecords(vehicleId, category, principal.getId());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/{recordId}")
    public ResponseEntity<ServiceRecordResponse> getServiceRecord(
            @PathVariable UUID vehicleId,
            @PathVariable UUID recordId,
            @AuthenticationPrincipal UserPrincipal principal) {
        ServiceRecordResponse record = serviceRecordService.getServiceRecord(vehicleId, recordId, principal.getId());
        return ResponseEntity.ok(record);
    }

    @PostMapping
    public ResponseEntity<ServiceRecordResponse> createServiceRecord(
            @PathVariable UUID vehicleId,
            @Valid @RequestBody CreateServiceRecordRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ServiceRecordResponse created = serviceRecordService.createServiceRecord(vehicleId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{recordId}")
    public ResponseEntity<ServiceRecordResponse> updateServiceRecord(
            @PathVariable UUID vehicleId,
            @PathVariable UUID recordId,
            @Valid @RequestBody CreateServiceRecordRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ServiceRecordResponse updated = serviceRecordService.updateServiceRecord(vehicleId, recordId, request, principal.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{recordId}")
    public ResponseEntity<Void> deleteServiceRecord(
            @PathVariable UUID vehicleId,
            @PathVariable UUID recordId,
            @AuthenticationPrincipal UserPrincipal principal) {
        serviceRecordService.deleteServiceRecord(vehicleId, recordId, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
