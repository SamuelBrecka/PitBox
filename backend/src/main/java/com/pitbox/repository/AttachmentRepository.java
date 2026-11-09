package com.pitbox.repository;

import com.pitbox.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

    List<Attachment> findByServiceRecordIdOrderByUploadedAtDesc(UUID serviceRecordId);

    Optional<Attachment> findByIdAndServiceRecordId(UUID id, UUID serviceRecordId);

    @Query("SELECT a FROM Attachment a WHERE a.serviceRecord.vehicle.id = :vehicleId ORDER BY a.uploadedAt DESC")
    List<Attachment> findAllByVehicleId(@Param("vehicleId") UUID vehicleId);

    @Query("SELECT a FROM Attachment a WHERE a.id = :attachmentId AND a.serviceRecord.vehicle.id = :vehicleId")
    Optional<Attachment> findByIdAndVehicleId(@Param("attachmentId") UUID attachmentId, @Param("vehicleId") UUID vehicleId);
}
