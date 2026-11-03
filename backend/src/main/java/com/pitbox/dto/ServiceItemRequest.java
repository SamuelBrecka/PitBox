package com.pitbox.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ServiceItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(max = 255, message = "Item name cannot exceed 255 characters")
    private String name;

    @NotBlank(message = "Item type is required")
    @Pattern(regexp = "PART|LABOR|FLUID", message = "Item type must be PART, LABOR, or FLUID")
    private String itemType;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.00", message = "Unit price cannot be negative")
    private BigDecimal unitPrice;

    public ServiceItemRequest() {
    }

    public ServiceItemRequest(String name, String itemType, Integer quantity, BigDecimal unitPrice) {
        this.name = name;
        this.itemType = itemType;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}
