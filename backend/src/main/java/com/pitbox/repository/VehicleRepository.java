package com.pitbox.repository;

import com.pitbox.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    List<Vehicle> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Vehicle> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
