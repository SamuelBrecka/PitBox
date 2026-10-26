package com.pitbox.dto;

import com.pitbox.model.Vehicle;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class VehicleResponse {

    private UUID id;
    private UUID userId;
    private String manufacturer;
    private String model;
    private Integer manufactureYear;
    private String licensePlate;
    private String vin;
    private String engineInfo;
    private String fuelType;
    private Integer currentMileage;
    private String photoPath;
    private Instant createdAt;

    public VehicleResponse() {
    }

    public static VehicleResponse fromEntity(Vehicle vehicle) {
        VehicleResponse response = new VehicleResponse();
        response.setId(vehicle.getId());
        response.setUserId(vehicle.getUser() != null ? vehicle.getUser().getId() : null);
        response.setManufacturer(vehicle.getManufacturer());
        response.setModel(vehicle.getModel());
        response.setManufactureYear(vehicle.getManufactureYear());
        response.setLicensePlate(vehicle.getLicensePlate());
        response.setVin(vehicle.getVin());
        response.setEngineInfo(vehicle.getEngineInfo());
        response.setFuelType(vehicle.getFuelType());
        response.setCurrentMileage(vehicle.getCurrentMileage());
        response.setPhotoPath(vehicle.getPhotoPath());
        response.setCreatedAt(vehicle.getCreatedAt());
        return response;
    }
}
