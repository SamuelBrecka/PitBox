package com.pitbox.service;

import com.pitbox.dto.CreateServiceRecordRequest;
import com.pitbox.dto.ServiceItemRequest;
import com.pitbox.dto.ServiceRecordResponse;
import com.pitbox.exception.ResourceNotFoundException;
import com.pitbox.model.MileageLog;
import com.pitbox.model.ServiceItem;
import com.pitbox.model.ServiceRecord;
import com.pitbox.model.Vehicle;
import com.pitbox.repository.MileageLogRepository;
import com.pitbox.repository.ServiceRecordRepository;
import com.pitbox.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ServiceRecordService {

    private final ServiceRecordRepository serviceRecordRepository;
    private final VehicleRepository vehicleRepository;
    private final MileageLogRepository mileageLogRepository;

    public ServiceRecordService(ServiceRecordRepository serviceRecordRepository,
                                VehicleRepository vehicleRepository,
                                MileageLogRepository mileageLogRepository) {
        this.serviceRecordRepository = serviceRecordRepository;
        this.vehicleRepository = vehicleRepository;
        this.mileageLogRepository = mileageLogRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceRecordResponse> getServiceRecords(UUID vehicleId, String category, UUID userId) {
        findVehicleForUser(vehicleId, userId);

        List<ServiceRecord> records;
        if (category != null && !category.isBlank()) {
            records = serviceRecordRepository.findByVehicleIdAndCategoryOrderByServiceDateDescCreatedAtDesc(
                vehicleId, category.trim().toUpperCase()
            );
        } else {
            records = serviceRecordRepository.findByVehicleIdOrderByServiceDateDescCreatedAtDesc(vehicleId);
        }

        return records.stream()
            .map(ServiceRecordResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public ServiceRecordResponse getServiceRecord(UUID vehicleId, UUID recordId, UUID userId) {
        findVehicleForUser(vehicleId, userId);
        ServiceRecord record = serviceRecordRepository.findByIdAndVehicleId(recordId, vehicleId)
            .orElseThrow(() -> new ResourceNotFoundException("Service record not found"));
        return ServiceRecordResponse.fromEntity(record);
    }

    public ServiceRecordResponse createServiceRecord(UUID vehicleId, CreateServiceRecordRequest request, UUID userId) {
        Vehicle vehicle = findVehicleForUser(vehicleId, userId);

        ServiceRecord record = new ServiceRecord();
        record.setVehicle(vehicle);
        applyRequestToRecord(record, request);

        ServiceRecord saved = serviceRecordRepository.save(record);

        syncOdometerIfForward(vehicle, request.getMileageAtService(), request.getServiceDate());

        return ServiceRecordResponse.fromEntity(saved);
    }

    public ServiceRecordResponse updateServiceRecord(UUID vehicleId, UUID recordId, CreateServiceRecordRequest request, UUID userId) {
        Vehicle vehicle = findVehicleForUser(vehicleId, userId);
        ServiceRecord record = serviceRecordRepository.findByIdAndVehicleId(recordId, vehicleId)
            .orElseThrow(() -> new ResourceNotFoundException("Service record not found"));

        record.clearItems();
        applyRequestToRecord(record, request);

        ServiceRecord updated = serviceRecordRepository.save(record);

        syncOdometerIfForward(vehicle, request.getMileageAtService(), request.getServiceDate());

        return ServiceRecordResponse.fromEntity(updated);
    }

    public void deleteServiceRecord(UUID vehicleId, UUID recordId, UUID userId) {
        findVehicleForUser(vehicleId, userId);
        ServiceRecord record = serviceRecordRepository.findByIdAndVehicleId(recordId, vehicleId)
            .orElseThrow(() -> new ResourceNotFoundException("Service record not found"));
        serviceRecordRepository.delete(record);
    }

    private void applyRequestToRecord(ServiceRecord record, CreateServiceRecordRequest request) {
        record.setServiceDate(request.getServiceDate());
        record.setMileageAtService(request.getMileageAtService());
        record.setCategory(request.getCategory().trim().toUpperCase());
        record.setWorkshopName(request.getWorkshopName() != null && !request.getWorkshopName().isBlank()
            ? request.getWorkshopName().trim()
            : null);
        record.setNotes(request.getNotes() != null && !request.getNotes().isBlank()
            ? request.getNotes().trim()
            : null);

        BigDecimal totalCost = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        for (ServiceItemRequest itemReq : request.getItems()) {
            ServiceItem item = new ServiceItem();
            item.setName(itemReq.getName().trim());
            item.setItemType(itemReq.getItemType().trim().toUpperCase());
            item.setQuantity(itemReq.getQuantity());
            BigDecimal unitPrice = itemReq.getUnitPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())).setScale(2, RoundingMode.HALF_UP);
            item.setUnitPrice(unitPrice);
            item.setTotalPrice(lineTotal);

            record.addItem(item);
            totalCost = totalCost.add(lineTotal);
        }

        record.setTotalCost(totalCost);
    }

    private void syncOdometerIfForward(Vehicle vehicle, Integer mileageAtService, java.time.LocalDate serviceDate) {
        if (mileageAtService != null && mileageAtService > vehicle.getCurrentMileage()) {
            vehicle.setCurrentMileage(mileageAtService);
            vehicleRepository.save(vehicle);

            MileageLog log = new MileageLog(vehicle, mileageAtService, serviceDate, "SERVICE_RECORD");
            mileageLogRepository.save(log);
        }
    }

    private Vehicle findVehicleForUser(UUID vehicleId, UUID userId) {
        return vehicleRepository.findByIdAndUserId(vehicleId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
    }
}
