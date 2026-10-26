package com.pitbox.dto;

import com.pitbox.model.MileageLog;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class MileageLogResponse {

    private UUID id;
    private UUID vehicleId;
    private Integer mileage;
    private LocalDate recordedAt;
    private String source;

    public MileageLogResponse() {
    }

    public static MileageLogResponse fromEntity(MileageLog log) {
        MileageLogResponse response = new MileageLogResponse();
        response.setId(log.getId());
        response.setVehicleId(log.getVehicle() != null ? log.getVehicle().getId() : null);
        response.setMileage(log.getMileage());
        response.setRecordedAt(log.getRecordedAt());
        response.setSource(log.getSource());
        return response;
    }
}
