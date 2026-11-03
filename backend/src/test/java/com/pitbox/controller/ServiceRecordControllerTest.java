package com.pitbox.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pitbox.dto.CreateServiceRecordRequest;
import com.pitbox.dto.CreateVehicleRequest;
import com.pitbox.dto.RegisterRequest;
import com.pitbox.dto.ServiceItemRequest;
import com.pitbox.repository.MileageLogRepository;
import com.pitbox.repository.ServiceRecordRepository;
import com.pitbox.repository.UserRepository;
import com.pitbox.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.closeTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ServiceRecordControllerTest {

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

    @Autowired
    private ServiceRecordRepository serviceRecordRepository;

    private String userToken;
    private String otherUserToken;
    private String vehicleId;

    @BeforeEach
    void setUp() throws Exception {
        serviceRecordRepository.deleteAll();
        mileageLogRepository.deleteAll();
        vehicleRepository.deleteAll();
        userRepository.deleteAll();

        userToken = registerUser("owner@pitbox.io", "password123", "Car Owner");
        otherUserToken = registerUser("other@pitbox.io", "password123", "Other Owner");
        vehicleId = createVehicleAndGetId(userToken, "Skoda", "Octavia", 150000);
    }

    private String registerUser(String email, String password, String fullName) throws Exception {
        RegisterRequest register = new RegisterRequest(email, password, fullName);
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
            .andExpect(status().isCreated())
            .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
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
    void shouldCreateServiceRecordCalculateTotalsAndAdvanceOdometer() throws Exception {
        CreateServiceRecordRequest request = new CreateServiceRecordRequest();
        request.setServiceDate(LocalDate.of(2026, 10, 20));
        request.setMileageAtService(152400);
        request.setCategory("MAINTENANCE");
        request.setWorkshopName("PitStop Auto");
        request.setNotes("Annual oil and filter service");
        request.setItems(List.of(
            new ServiceItemRequest("Engine Oil 5W-30 (5L)", "FLUID", 1, new BigDecimal("45.50")),
            new ServiceItemRequest("MANN Oil Filter", "PART", 1, new BigDecimal("14.50")),
            new ServiceItemRequest("Mechanic Labor", "LABOR", 2, new BigDecimal("30.00"))
        ));

        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-records")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", notNullValue()))
            .andExpect(jsonPath("$.vehicleId", is(vehicleId)))
            .andExpect(jsonPath("$.category", is("MAINTENANCE")))
            .andExpect(jsonPath("$.mileageAtService", is(152400)))
            .andExpect(jsonPath("$.totalCost", closeTo(120.00, 0.001)))
            .andExpect(jsonPath("$.items", hasSize(3)))
            .andExpect(jsonPath("$.items[2].totalPrice", closeTo(60.00, 0.001)));

        // Verify vehicle currentMileage auto-advanced to 152400
        mockMvc.perform(get("/api/vehicles/" + vehicleId)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentMileage", is(152400)));

        // Verify mileage_logs appended SERVICE_RECORD audit log
        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/mileage-logs")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].mileage", is(152400)))
            .andExpect(jsonPath("$[0].source", is("SERVICE_RECORD")));
    }

    @Test
    void shouldAllowRetroactiveServiceEntryWithoutReducingVehicleMileage() throws Exception {
        CreateServiceRecordRequest request = new CreateServiceRecordRequest();
        request.setServiceDate(LocalDate.of(2025, 5, 10));
        request.setMileageAtService(130000); // Lower than current 150000
        request.setCategory("REPAIR");
        request.setWorkshopName("DIY Garage");
        request.setItems(List.of(
            new ServiceItemRequest("Rear Brake Pads", "PART", 1, new BigDecimal("55.00"))
        ));

        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-records")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.mileageAtService", is(130000)))
            .andExpect(jsonPath("$.totalCost", closeTo(55.00, 0.001)));

        // Vehicle currentMileage must remain at 150000
        mockMvc.perform(get("/api/vehicles/" + vehicleId)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentMileage", is(150000)));

        // Mileage logs should still only have the initial 150000 entry
        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/mileage-logs")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void shouldFilterServiceRecordsByCategory() throws Exception {
        CreateServiceRecordRequest maint = new CreateServiceRecordRequest();
        maint.setServiceDate(LocalDate.of(2026, 9, 1));
        maint.setMileageAtService(150500);
        maint.setCategory("MAINTENANCE");
        maint.setItems(List.of(new ServiceItemRequest("Cabin Filter", "PART", 1, new BigDecimal("20.00"))));

        CreateServiceRecordRequest insp = new CreateServiceRecordRequest();
        insp.setServiceDate(LocalDate.of(2026, 10, 1));
        insp.setMileageAtService(151000);
        insp.setCategory("INSPECTION");
        insp.setItems(List.of(new ServiceItemRequest("STK & EK Inspection", "LABOR", 1, new BigDecimal("85.00"))));

        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-records")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(maint)))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-records")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(insp)))
            .andExpect(status().isCreated());

        // Unfiltered returns 2 ordered newest first
        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/service-records")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].category", is("INSPECTION")))
            .andExpect(jsonPath("$[1].category", is("MAINTENANCE")));

        // Filtered by REPAIR returns 0
        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/service-records?category=REPAIR")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));

        // Filtered by MAINTENANCE returns 1
        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/service-records?category=MAINTENANCE")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].category", is("MAINTENANCE")));
    }

    @Test
    void shouldUpdateAndDeleteServiceRecord() throws Exception {
        CreateServiceRecordRequest create = new CreateServiceRecordRequest();
        create.setServiceDate(LocalDate.of(2026, 10, 1));
        create.setMileageAtService(151000);
        create.setCategory("OTHER");
        create.setItems(List.of(new ServiceItemRequest("Wiper Blades", "PART", 2, new BigDecimal("15.00"))));

        MvcResult res = mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-records")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(create)))
            .andExpect(status().isCreated())
            .andReturn();

        String recordId = objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText();

        // Update record with new line items and higher mileage
        CreateServiceRecordRequest update = new CreateServiceRecordRequest();
        update.setServiceDate(LocalDate.of(2026, 10, 5));
        update.setMileageAtService(153000);
        update.setCategory("REPAIR");
        update.setWorkshopName("Bosch Service");
        update.setItems(List.of(
            new ServiceItemRequest("Battery 74Ah", "PART", 1, new BigDecimal("110.00")),
            new ServiceItemRequest("Installation", "LABOR", 1, new BigDecimal("25.00"))
        ));

        mockMvc.perform(put("/api/vehicles/" + vehicleId + "/service-records/" + recordId)
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.category", is("REPAIR")))
            .andExpect(jsonPath("$.totalCost", closeTo(135.00, 0.001)))
            .andExpect(jsonPath("$.items", hasSize(2)));

        // Delete record
        mockMvc.perform(delete("/api/vehicles/" + vehicleId + "/service-records/" + recordId)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/service-records/" + recordId)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldEnforceTenantIsolationAndValidation() throws Exception {
        CreateServiceRecordRequest invalid = new CreateServiceRecordRequest();
        invalid.setServiceDate(null);
        invalid.setMileageAtService(-5);
        invalid.setCategory("INVALID_CAT");
        invalid.setItems(List.of()); // Empty items not allowed

        mockMvc.perform(post("/api/vehicles/" + vehicleId + "/service-records")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error", is("Validation failed")));

        // Other user cannot access user's vehicle service records
        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/service-records")
                .header("Authorization", "Bearer " + otherUserToken))
            .andExpect(status().isNotFound());
    }
}
