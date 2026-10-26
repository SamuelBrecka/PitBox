package com.pitbox.service;

import com.pitbox.dto.CreateVehicleRequest;
import com.pitbox.dto.MileageLogResponse;
import com.pitbox.dto.UpdateMileageRequest;
import com.pitbox.dto.UpdateVehicleRequest;
import com.pitbox.dto.VehicleResponse;
import com.pitbox.exception.InvalidMileageException;
import com.pitbox.exception.ResourceNotFoundException;
import com.pitbox.model.MileageLog;
import com.pitbox.model.User;
import com.pitbox.model.Vehicle;
import com.pitbox.repository.MileageLogRepository;
import com.pitbox.repository.UserRepository;
import com.pitbox.repository.VehicleRepository;
import com.pitbox.service.storage.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final MileageLogRepository mileageLogRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public VehicleService(VehicleRepository vehicleRepository,
                          MileageLogRepository mileageLogRepository,
                          UserRepository userRepository,
                          FileStorageService fileStorageService) {
        this.vehicleRepository = vehicleRepository;
        this.mileageLogRepository = mileageLogRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getVehicles(UUID userId) {
        return vehicleRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(VehicleResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public VehicleResponse getVehicle(UUID id, UUID userId) {
        Vehicle vehicle = findVehicleForUser(id, userId);
        return VehicleResponse.fromEntity(vehicle);
    }

    public VehicleResponse createVehicle(CreateVehicleRequest request, UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Vehicle vehicle = new Vehicle();
        vehicle.setUser(user);
        vehicle.setManufacturer(request.getManufacturer().trim());
        vehicle.setModel(request.getModel().trim());
        vehicle.setManufactureYear(request.getManufactureYear());
        vehicle.setLicensePlate(request.getLicensePlate().trim().toUpperCase());
        vehicle.setVin(request.getVin() != null && !request.getVin().isBlank() ? request.getVin().trim().toUpperCase() : null);
        vehicle.setEngineInfo(request.getEngineInfo() != null && !request.getEngineInfo().isBlank() ? request.getEngineInfo().trim() : null);
        vehicle.setFuelType(request.getFuelType().trim().toUpperCase());
        vehicle.setCurrentMileage(request.getCurrentMileage());

        Vehicle saved = vehicleRepository.save(vehicle);

        if (request.getCurrentMileage() != null && request.getCurrentMileage() > 0) {
            MileageLog log = new MileageLog(saved, request.getCurrentMileage(), LocalDate.now(), "MANUAL_DASHBOARD");
            mileageLogRepository.save(log);
        }

        return VehicleResponse.fromEntity(saved);
    }

    public VehicleResponse updateVehicle(UUID id, UpdateVehicleRequest request, UUID userId) {
        Vehicle vehicle = findVehicleForUser(id, userId);

        vehicle.setManufacturer(request.getManufacturer().trim());
        vehicle.setModel(request.getModel().trim());
        vehicle.setManufactureYear(request.getManufactureYear());
        vehicle.setLicensePlate(request.getLicensePlate().trim().toUpperCase());
        vehicle.setVin(request.getVin() != null && !request.getVin().isBlank() ? request.getVin().trim().toUpperCase() : null);
        vehicle.setEngineInfo(request.getEngineInfo() != null && !request.getEngineInfo().isBlank() ? request.getEngineInfo().trim() : null);
        vehicle.setFuelType(request.getFuelType().trim().toUpperCase());

        Vehicle updated = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(updated);
    }

    public void deleteVehicle(UUID id, UUID userId) {
        Vehicle vehicle = findVehicleForUser(id, userId);
        if (vehicle.getPhotoPath() != null) {
            fileStorageService.deleteFile(vehicle.getPhotoPath());
        }
        vehicleRepository.delete(vehicle);
    }

    public VehicleResponse updateMileage(UUID id, UpdateMileageRequest request, UUID userId) {
        Vehicle vehicle = findVehicleForUser(id, userId);

        if (request.getMileage() <= vehicle.getCurrentMileage()) {
            throw new InvalidMileageException("New mileage must be greater than current mileage (" + vehicle.getCurrentMileage() + " km)");
        }

        vehicle.setCurrentMileage(request.getMileage());
        Vehicle updated = vehicleRepository.save(vehicle);

        MileageLog log = new MileageLog(updated, request.getMileage(), LocalDate.now(), "MANUAL_DASHBOARD");
        mileageLogRepository.save(log);

        return VehicleResponse.fromEntity(updated);
    }

    public VehicleResponse uploadPhoto(UUID id, MultipartFile file, UUID userId) {
        Vehicle vehicle = findVehicleForUser(id, userId);

        if (vehicle.getPhotoPath() != null) {
            fileStorageService.deleteFile(vehicle.getPhotoPath());
        }

        String photoPath = fileStorageService.storeFile(file, "vehicles");
        vehicle.setPhotoPath(photoPath);
        Vehicle updated = vehicleRepository.save(vehicle);

        return VehicleResponse.fromEntity(updated);
    }

    public VehicleResponse deletePhoto(UUID id, UUID userId) {
        Vehicle vehicle = findVehicleForUser(id, userId);

        if (vehicle.getPhotoPath() != null) {
            fileStorageService.deleteFile(vehicle.getPhotoPath());
            vehicle.setPhotoPath(null);
            vehicle = vehicleRepository.save(vehicle);
        }

        return VehicleResponse.fromEntity(vehicle);
    }

    @Transactional(readOnly = true)
    public List<MileageLogResponse> getMileageLogs(UUID vehicleId, UUID userId) {
        // Enforce ownership
        findVehicleForUser(vehicleId, userId);

        return mileageLogRepository.findByVehicleIdOrderByRecordedAtDescMileageDesc(vehicleId)
            .stream()
            .map(MileageLogResponse::fromEntity)
            .toList();
    }

    private Vehicle findVehicleForUser(UUID id, UUID userId) {
        return vehicleRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
    }
}
