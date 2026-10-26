package com.pitbox.controller;

import com.pitbox.dto.CreateVehicleRequest;
import com.pitbox.dto.MileageLogResponse;
import com.pitbox.dto.UpdateMileageRequest;
import com.pitbox.dto.UpdateVehicleRequest;
import com.pitbox.dto.VehicleResponse;
import com.pitbox.security.UserPrincipal;
import com.pitbox.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getVehicles(@AuthenticationPrincipal UserPrincipal principal) {
        List<VehicleResponse> vehicles = vehicleService.getVehicles(principal.getId());
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicle(@PathVariable UUID id,
                                                      @AuthenticationPrincipal UserPrincipal principal) {
        VehicleResponse vehicle = vehicleService.getVehicle(id, principal.getId());
        return ResponseEntity.ok(vehicle);
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody CreateVehicleRequest request,
                                                         @AuthenticationPrincipal UserPrincipal principal) {
        VehicleResponse response = vehicleService.createVehicle(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(@PathVariable UUID id,
                                                         @Valid @RequestBody UpdateVehicleRequest request,
                                                         @AuthenticationPrincipal UserPrincipal principal) {
        VehicleResponse response = vehicleService.updateVehicle(id, request, principal.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID id,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        vehicleService.deleteVehicle(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/mileage")
    public ResponseEntity<VehicleResponse> updateMileage(@PathVariable UUID id,
                                                         @Valid @RequestBody UpdateMileageRequest request,
                                                         @AuthenticationPrincipal UserPrincipal principal) {
        VehicleResponse response = vehicleService.updateMileage(id, request, principal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VehicleResponse> uploadPhoto(@PathVariable UUID id,
                                                       @RequestParam("file") MultipartFile file,
                                                       @AuthenticationPrincipal UserPrincipal principal) {
        VehicleResponse response = vehicleService.uploadPhoto(id, file, principal.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/photo")
    public ResponseEntity<VehicleResponse> deletePhoto(@PathVariable UUID id,
                                                       @AuthenticationPrincipal UserPrincipal principal) {
        VehicleResponse response = vehicleService.deletePhoto(id, principal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/mileage-logs")
    public ResponseEntity<List<MileageLogResponse>> getMileageLogs(@PathVariable UUID id,
                                                                   @AuthenticationPrincipal UserPrincipal principal) {
        List<MileageLogResponse> logs = vehicleService.getMileageLogs(id, principal.getId());
        return ResponseEntity.ok(logs);
    }
}
