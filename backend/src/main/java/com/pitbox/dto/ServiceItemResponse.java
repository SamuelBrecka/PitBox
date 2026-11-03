package com.pitbox.dto;

import com.pitbox.model.ServiceItem;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class ServiceItemResponse {

    private UUID id;
    private String name;
    private String itemType;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    public ServiceItemResponse() {
    }

    public static ServiceItemResponse fromEntity(ServiceItem item) {
        ServiceItemResponse response = new ServiceItemResponse();
        response.setId(item.getId());
        response.setName(item.getName());
        response.setItemType(item.getItemType());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setTotalPrice(item.getTotalPrice());
        return response;
    }
}
