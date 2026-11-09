package com.pitbox.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pitbox.dto.CreateServiceRecordRequest;
import com.pitbox.dto.CreateVehicleRequest;
import com.pitbox.dto.RegisterRequest;
import com.pitbox.dto.ServiceItemRequest;
import com.pitbox.repository.AttachmentRepository;
import com.pitbox.repository.MileageLogRepository;
import com.pitbox.repository.ServiceRecordRepository;
import com.pitbox.repository.UserRepository;
import com.pitbox.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AttachmentControllerTest {

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

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Value("${pitbox.storage.upload-dir:./uploads}")
    private String uploadDir;

    private String userToken;
    private String otherUserToken;
    private String vehicleId;
    private String serviceRecordId;

    @BeforeEach
    void setUp() throws Exception {
        attachmentRepository.deleteAll();
        serviceRecordRepository.deleteAll();
        mileageLogRepository.deleteAll();
        vehicleRepository.deleteAll();
        userRepository.deleteAll();

        userToken = registerUser("owner@pitbox.io", "password123", "Vehicle Owner");
        otherUserToken = registerUser("other@pitbox.io", "password123", "Other Owner");
        vehicleId = createVehicleAndGetId(userToken, "Skoda", "Octavia", 150000);
        serviceRecordId = createServiceRecordAndGetId(userToken, vehicleId);
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
        request.setManufactureYear(2021);
        request.setLicensePlate("BA-777PB");
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

    private String createServiceRecordAndGetId(String token, String vehId) throws Exception {
        CreateServiceRecordRequest request = new CreateServiceRecordRequest();
        request.setServiceDate(LocalDate.of(2026, 10, 15));
        request.setMileageAtService(151000);
        request.setCategory("MAINTENANCE");
        request.setWorkshopName("PitBox Garage");
        request.setItems(List.of(
            new ServiceItemRequest("Engine Oil 5W-30", "FLUID", 1, new BigDecimal("50.00"))
        ));

        MvcResult result = mockMvc.perform(post("/api/vehicles/" + vehId + "/service-records")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }

    @Test
    void shouldUploadImageAndPdfAttachmentsAndVerifyStorageOnDisk() throws Exception {
        MockMultipartFile imageFile = new MockMultipartFile(
            "files", "receipt.jpg", "image/jpeg", "fake-jpeg-content".getBytes()
        );
        MockMultipartFile pdfFile = new MockMultipartFile(
            "files", "invoice.pdf", "application/pdf", "%PDF-1.4 fake invoice content".getBytes()
        );

        MvcResult result = mockMvc.perform(multipart("/api/vehicles/" + vehicleId + "/service-records/" + serviceRecordId + "/attachments")
                .file(imageFile)
                .file(pdfFile)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].fileName", is("receipt.jpg")))
            .andExpect(jsonPath("$[0].contentType", is("image/jpeg")))
            .andExpect(jsonPath("$[0].storagePath", notNullValue()))
            .andExpect(jsonPath("$[1].fileName", is("invoice.pdf")))
            .andExpect(jsonPath("$[1].contentType", is("application/pdf")))
            .andReturn();

        String imageStoragePath = objectMapper.readTree(result.getResponse().getContentAsString()).get(0).get("storagePath").asText();
        String pdfStoragePath = objectMapper.readTree(result.getResponse().getContentAsString()).get(1).get("storagePath").asText();

        Path rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path imageOnDisk = rootPath.resolve(imageStoragePath.replaceFirst("^/uploads/", "")).normalize();
        Path pdfOnDisk = rootPath.resolve(pdfStoragePath.replaceFirst("^/uploads/", "")).normalize();

        assertThat(Files.exists(imageOnDisk)).isTrue();
        assertThat(Files.exists(pdfOnDisk)).isTrue();

        // Query by record
        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/service-records/" + serviceRecordId + "/attachments")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));

        // Query by vehicle
        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/attachments")
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void shouldDeleteAttachmentAndPurgeFromDisk() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "files", "invoice.pdf", "application/pdf", "%PDF-1.4 sample".getBytes()
        );

        MvcResult uploadRes = mockMvc.perform(multipart("/api/vehicles/" + vehicleId + "/service-records/" + serviceRecordId + "/attachments")
                .file(file)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isCreated())
            .andReturn();

        String attachmentId = objectMapper.readTree(uploadRes.getResponse().getContentAsString()).get(0).get("id").asText();
        String storagePath = objectMapper.readTree(uploadRes.getResponse().getContentAsString()).get(0).get("storagePath").asText();

        Path rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path fileOnDisk = rootPath.resolve(storagePath.replaceFirst("^/uploads/", "")).normalize();
        assertThat(Files.exists(fileOnDisk)).isTrue();

        // Delete attachment
        mockMvc.perform(delete("/api/vehicles/" + vehicleId + "/service-records/" + serviceRecordId + "/attachments/" + attachmentId)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isNoContent());

        assertThat(Files.exists(fileOnDisk)).isFalse();
        assertThat(attachmentRepository.findById(java.util.UUID.fromString(attachmentId))).isEmpty();
    }

    @Test
    void shouldPurgeAttachmentsWhenServiceRecordIsDeleted() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "files", "doc.pdf", "application/pdf", "%PDF-1.4 delete test".getBytes()
        );

        MvcResult uploadRes = mockMvc.perform(multipart("/api/vehicles/" + vehicleId + "/service-records/" + serviceRecordId + "/attachments")
                .file(file)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isCreated())
            .andReturn();

        String storagePath = objectMapper.readTree(uploadRes.getResponse().getContentAsString()).get(0).get("storagePath").asText();
        Path rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path fileOnDisk = rootPath.resolve(storagePath.replaceFirst("^/uploads/", "")).normalize();
        assertThat(Files.exists(fileOnDisk)).isTrue();

        // Delete service record
        mockMvc.perform(delete("/api/vehicles/" + vehicleId + "/service-records/" + serviceRecordId)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isNoContent());

        assertThat(Files.exists(fileOnDisk)).isFalse();
    }

    @Test
    void shouldEnforceTenantIsolationAndFileValidation() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "files", "invoice.pdf", "application/pdf", "%PDF-1.4 test".getBytes()
        );

        // Other user cannot upload to vehicle they do not own
        mockMvc.perform(multipart("/api/vehicles/" + vehicleId + "/service-records/" + serviceRecordId + "/attachments")
                .file(file)
                .header("Authorization", "Bearer " + otherUserToken))
            .andExpect(status().isNotFound());

        // Other user cannot list attachments
        mockMvc.perform(get("/api/vehicles/" + vehicleId + "/attachments")
                .header("Authorization", "Bearer " + otherUserToken))
            .andExpect(status().isNotFound());

        // Unsupported file type rejected
        MockMultipartFile invalidFile = new MockMultipartFile(
            "files", "virus.exe", "application/x-msdownload", new byte[]{0x4D, 0x5A}
        );
        mockMvc.perform(multipart("/api/vehicles/" + vehicleId + "/service-records/" + serviceRecordId + "/attachments")
                .file(invalidFile)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isBadRequest());
    }
}
