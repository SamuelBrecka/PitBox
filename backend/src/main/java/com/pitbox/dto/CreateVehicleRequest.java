package com.pitbox.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateVehicleRequest {

    @NotBlank(message = "Manufacturer is required")
    @Size(max = 100, message = "Manufacturer cannot exceed 100 characters")
    private String manufacturer;

    @NotBlank(message = "Model is required")
    @Size(max = 100, message = "Model cannot exceed 100 characters")
    private String model;

    @NotNull(message = "Manufacture year is required")
    @Min(value = 1900, message = "Manufacture year must be at least 1900")
    @Max(value = 2100, message = "Manufacture year cannot exceed 2100")
    private Integer manufactureYear;

    @NotBlank(message = "License plate is required")
    @Size(max = 30, message = "License plate cannot exceed 30 characters")
    private String licensePlate;

    @Size(max = 17, message = "VIN cannot exceed 17 characters")
    private String vin;

    @Size(max = 100, message = "Engine info cannot exceed 100 characters")
    private String engineInfo;

    @NotBlank(message = "Fuel type is required")
    @Size(max = 30, message = "Fuel type cannot exceed 30 characters")
    private String fuelType;

    @NotNull(message = "Current mileage is required")
    @Min(value = 0, message = "Current mileage cannot be negative")
    private Integer currentMileage;
}
