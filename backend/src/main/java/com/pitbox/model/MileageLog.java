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

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "mileage_logs")
@Getter
@Setter
public class MileageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Vehicle vehicle;

    @Column(nullable = false)
    private Integer mileage;

    @Column(name = "recorded_at", nullable = false)
    private LocalDate recordedAt;

    @Column(nullable = false, length = 50)
    private String source;

    public MileageLog() {
    }

    public MileageLog(Vehicle vehicle, Integer mileage, LocalDate recordedAt, String source) {
        this.vehicle = vehicle;
        this.mileage = mileage;
        this.recordedAt = recordedAt;
        this.source = source;
    }

    @PrePersist
    protected void onCreate() {
        if (recordedAt == null) {
            recordedAt = LocalDate.now();
        }
    }
}
