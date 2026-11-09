package com.pitbox.dto;

import com.pitbox.model.ServiceRecord;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ServiceRecordResponse {

    private UUID id;
    private UUID vehicleId;
    private LocalDate serviceDate;
    private Integer mileageAtService;
    private String category;
    private String workshopName;
    private BigDecimal totalCost;
    private String notes;
    private Instant createdAt;
    private List<ServiceItemResponse> items;
    private List<AttachmentResponse> attachments;

    public ServiceRecordResponse() {
    }

    public static ServiceRecordResponse fromEntity(ServiceRecord record) {
        ServiceRecordResponse response = new ServiceRecordResponse();
        response.setId(record.getId());
        response.setVehicleId(record.getVehicle() != null ? record.getVehicle().getId() : null);
        response.setServiceDate(record.getServiceDate());
        response.setMileageAtService(record.getMileageAtService());
        response.setCategory(record.getCategory());
        response.setWorkshopName(record.getWorkshopName());
        response.setTotalCost(record.getTotalCost());
        response.setNotes(record.getNotes());
        response.setCreatedAt(record.getCreatedAt());
        response.setItems(record.getItems() != null
            ? record.getItems().stream().map(ServiceItemResponse::fromEntity).toList()
            : List.of());
        response.setAttachments(record.getAttachments() != null
            ? record.getAttachments().stream().map(AttachmentResponse::fromEntity).toList()
            : List.of());
        return response;
    }
}
