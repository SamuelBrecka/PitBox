package com.pitbox.repository;

import com.pitbox.model.ServiceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, UUID> {

    List<ServiceRecord> findByVehicleIdOrderByServiceDateDescCreatedAtDesc(UUID vehicleId);

    List<ServiceRecord> findByVehicleIdAndCategoryOrderByServiceDateDescCreatedAtDesc(UUID vehicleId, String category);

    Optional<ServiceRecord> findByIdAndVehicleId(UUID id, UUID vehicleId);
}
