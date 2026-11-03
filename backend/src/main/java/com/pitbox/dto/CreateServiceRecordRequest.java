package com.pitbox.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CreateServiceRecordRequest {

    @NotNull(message = "Service date is required")
    private LocalDate serviceDate;

    @NotNull(message = "Mileage at service is required")
    @Min(value = 0, message = "Mileage cannot be negative")
    private Integer mileageAtService;

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "MAINTENANCE|REPAIR|INSPECTION|OTHER", message = "Category must be MAINTENANCE, REPAIR, INSPECTION, or OTHER")
    private String category;

    @Size(max = 255, message = "Workshop name cannot exceed 255 characters")
    private String workshopName;

    @Size(max = 4000, message = "Notes cannot exceed 4000 characters")
    private String notes;

    @NotEmpty(message = "At least one service item is required")
    @Valid
    private List<ServiceItemRequest> items = new ArrayList<>();

    public CreateServiceRecordRequest() {
    }
}
