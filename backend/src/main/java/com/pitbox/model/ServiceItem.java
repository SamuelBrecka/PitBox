package com.pitbox.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "service_items")
@Getter
@Setter
public class ServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_record_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ServiceRecord serviceRecord;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "item_type", nullable = false, length = 50)
    private String itemType;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    public ServiceItem() {
    }

    @PrePersist
    protected void onCreate() {
        if (quantity == null) {
            quantity = 1;
        }
        if (unitPrice == null) {
            unitPrice = BigDecimal.ZERO;
        }
        if (totalPrice == null) {
            totalPrice = BigDecimal.ZERO;
        }
    }
}
