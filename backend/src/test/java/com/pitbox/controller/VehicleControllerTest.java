package com.pitbox.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pitbox.dto.CreateVehicleRequest;
import com.pitbox.dto.RegisterRequest;
import com.pitbox.dto.UpdateMileageRequest;
import com.pitbox.dto.UpdateVehicleRequest;
import com.pitbox.repository.MileageLogRepository;
import com.pitbox.repository.UserRepository;
import com.pitbox.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private MileageLogRepository mileageLogRepository;

    private String userToken;
    private String otherUserToken;

    @BeforeEach
    void setUp() throws Exception {
        mileageLogRepository.deleteAll();
        vehicleRepository.deleteAll();
        userRepository.deleteAll();

        userToken = registerUser("owner@pitbox.io", "password123", "Car Owner");
        otherUserToken = registerUser("other@pitbox.io", "password123", "Other Owner");
    }

    private String registerUser(String email, String password, String fullName) throws Exception {
        RegisterRequest register = new RegisterRequest(email, password, fullName);
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
            .andExpect(status().isCreated())
            .andReturn();
        String json = result.getResponse().getContentAsString();
        return objectMapper.readTree(json).get("token").asText();
    }

    private String createVehicleAndGetId(String token, String make, String model, int mileage) throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setManufacturer(make);
        request.setModel(model);
        request.setManufactureYear(2020);
        request.setLicensePlate("BA-100AA");
        request.setFuelType("DIESEL");
        request.setCurrentMileage(mileage);

        MvcResult result = mockMvc.perform(post("/api/vehicles")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }

    @Test
    void shouldCreateVehicleSuccessfullyAndRecordInitialMileage() throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setManufacturer("Skoda");
        request.setModel("Octavia");
        request.setManufactureYear(2018);
        request.setLicensePlate("BL-888XY");
        request.setFuelType("DIESEL");
        request.setVin("TMBJH7NE0K0000000");
        request.setEngineInfo("2.0 TDI 110kW");
        request.setCurrentMileage(150000);

        mockMvc.perform(post("/api/vehicles")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", notNullValue()))
            .andExpect(jsonPath("$.manufacturer", is("Skoda")))
            .andExpect(jsonPath("$.model", is("Octavia")))
            .andExpect(jsonPath("$.licensePlate", is("BL-888XY")))
            .andExpect(jsonPath("$.currentMileage", is(150000)));

        // Verify initial mileage log entry was created
        mockMvc.perform(get("/api/vehicles")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void shouldFailCreatingVehicleWithInvalidInputs() throws Exception {
        CreateVehicleRequest request = new CreateVehicleRequest();
        request.setManufacturer(""); // invalid blank
        request.setModel("Civic");
        request.setManufactureYear(1800); // invalid year
        request.setLicensePlate("");
        request.setFuelType("");
        request.setCurrentMileage(-10); // invalid negative

        mockMvc.perform(post("/api/vehicles")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error", is("Validation failed")))
            .andExpect(jsonPath("$.details.manufacturer", notNullValue()))
            .andExpect(jsonPath("$.details.manufactureYear", notNullValue()))
            .andExpect(jsonPath("$.details.currentMileage", notNullValue()));
    }

    @Test
    void shouldEnforceTenantIsolationOnList() throws Exception {
        createVehicleAndGetId(userToken, "Skoda", "Octavia", 100000);
        createVehicleAndGetId(otherUserToken, "BMW", "320d", 80000);

        // User should only see their own vehicle
        mockMvc.perform(get("/api/vehicles")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].manufacturer", is("Skoda")));

        // Other user should only see their vehicle
        mockMvc.perform(get("/api/vehicles")
                .header("Authorization", "Bearer " + otherUserToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].manufacturer", is("BMW")));
    }

    @Test
    void shouldRejectAccessToOtherUserVehicle() throws Exception {
        String vehicleId = createVehicleAndGetId(userToken, "Audi", "A4", 50000);

        // Other user attempts to get user's vehicle -> 404
        mockMvc.perform(get("/api/vehicles/" + vehicleId)
                .header("Authorization", "Bearer " + otherUserToken))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error", is("Vehicle not found")));
    }

    @Test
    void shouldUpdateVehicleDetailsSuccessfully() throws Exception {
        String vehicleId = createVehicleAndGetId(userToken, "Volkswagen", "Golf", 90000);

        UpdateVehicleRequest update = new UpdateVehicleRequest();
        update.setManufacturer("Volkswagen");
        update.setModel("Golf Variant");
        update.setManufactureYear(2021);
        update.setLicensePlate("BA-777ZZ");
        update.setFuelType("PETROL");
        update.setVin("WVWZZZAUZMP000000");
        update.setEngineInfo("1.5 TSI 110kW");

        mockMvc.perform(put("/api/vehicles/" + vehicleId)
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.model", is("Golf Variant")))
            .andExpect(jsonPath("$.licensePlate", is("BA-777ZZ")))
            .andExpect(jsonPath("$.fuelType", is("PETROL")));
    }

    @Test
    void shouldUpdateMileageForwardAndAppendAuditLog() throws Exception {
        String vehicleId = createVehicleAndGetId(userToken, "Toyota", "Corolla", 60000);

        UpdateMileageRequest mileageRequest = new UpdateMileageRequest(65000);

        mockMvc.perform(patch("/api/vehicles/" + vehicleId + "/mileage")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mileageRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentMileage", is(65000)));

        // Verify audit log has 2 records (initial 60000 and update 65000)
        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/mileage-logs")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].mileage", is(65000)))
            .andExpect(jsonPath("$[0].source", is("MANUAL_DASHBOARD")));
    }

    @Test
    void shouldRejectMileageUpdateWhenNotForward() throws Exception {
        String vehicleId = createVehicleAndGetId(userToken, "Mazda", "3", 70000);

        // Attempt lower mileage
        UpdateMileageRequest lower = new UpdateMileageRequest(69999);
        mockMvc.perform(patch("/api/vehicles/" + vehicleId + "/mileage")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lower)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error", notNullValue()));

        // Attempt equal mileage
        UpdateMileageRequest equal = new UpdateMileageRequest(70000);
        mockMvc.perform(patch("/api/vehicles/" + vehicleId + "/mileage")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(equal)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldUploadAndDeleteVehiclePhoto() throws Exception {
        String vehicleId = createVehicleAndGetId(userToken, "Ford", "Focus", 40000);

        MockMultipartFile file = new MockMultipartFile(
            "file",
            "car.jpg",
            "image/jpeg",
            "mock-image-binary-data".getBytes()
        );

        mockMvc.perform(multipart("/api/vehicles/" + vehicleId + "/photo")
                .file(file)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.photoPath", notNullValue()));

        // Delete photo
        mockMvc.perform(delete("/api/vehicles/" + vehicleId + "/photo")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.photoPath").doesNotExist());
    }

    @Test
    void shouldDeleteVehicleSuccessfully() throws Exception {
        String vehicleId = createVehicleAndGetId(userToken, "Hyundai", "i30", 30000);

        mockMvc.perform(delete("/api/vehicles/" + vehicleId)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/vehicles/" + vehicleId)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isNotFound());
    }
}
