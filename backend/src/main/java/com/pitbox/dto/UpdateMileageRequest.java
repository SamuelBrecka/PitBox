package com.pitbox.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMileageRequest {

    @NotNull(message = "Mileage is required")
    @Min(value = 0, message = "Mileage cannot be negative")
    private Integer mileage;

    public UpdateMileageRequest() {
    }

    public UpdateMileageRequest(Integer mileage) {
        this.mileage = mileage;
    }
}
