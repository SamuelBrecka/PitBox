# PitBox Project Structure & File Map

This document serves as the canonical map of code modules, pages, and architectural boundaries in PitBox.
Agents and developers must consult this file before guessing file names or locations.

---

## 1. Frontend Architecture (`frontend/src/`)

```text
frontend/src/
├── main.tsx                         # App entrypoint (React DOM root mount, AuthProvider)
├── index.css                        # Global styles & Tailwind CSS base directives
├── App.tsx                          # App root container & layout shell
├── router/
│   └── Router.tsx                   # React Router route definitions & protected route guards
├── pages/
│   ├── LandingPage.tsx              # Public home page with CTA, hero, and features overview
│   ├── LoginPage.tsx                # User authentication / login form
│   ├── RegisterPage.tsx             # User registration form
│   ├── GaragePage.tsx               # Main user dashboard: vehicle list, summary metrics, quick actions
│   └── VehicleDetailPage.tsx        # Specific vehicle view: specs, mileage history, service timeline, gallery
├── components/
│   ├── Navbar.tsx                   # Global top navigation bar with user profile and logout
│   ├── ProtectedRoute.tsx           # Route protection wrapper enforcing valid auth tokens
│   ├── VehicleCard.tsx              # Vehicle summary card component used in Garage grid
│   ├── VehicleModal.tsx             # Add / edit vehicle modal dialog and form
│   ├── QuickMileageModal.tsx        # Fast odometer update modal
│   ├── ServiceRecordModal.tsx       # Add / edit service history entry modal with dropzone attachments
│   ├── UploadAttachmentModal.tsx    # Standalone modal for uploading documents/photos directly from gallery tab
│   └── AttachmentLightbox.tsx       # Fullscreen responsive media lightbox with keyboard navigation & download
├── context/
│   └── AuthContext.tsx              # Authentication state, login/logout functions, JWT handling
├── api/
│   ├── client.ts                    # Axios / Fetch HTTP client with JWT interceptor & base URL
│   ├── vehicleApi.ts                # Vehicle endpoints (CRUD, mileage updates, image upload)
│   ├── serviceRecordApi.ts          # Service record endpoints (CRUD, category filtering)
│   └── attachmentApi.ts             # Attachment endpoints (multi-file upload, record/vehicle listing, delete)
├── types/
│   ├── auth.ts                      # Auth DTO interfaces (User, LoginRequest, AuthResponse)
│   ├── vehicle.ts                   # Vehicle entity & DTO interfaces (Vehicle, MileageLog)
│   └── serviceRecord.ts             # Service record, itemized service items, and Attachment interfaces
└── utils/
    └── compression.ts               # Client-side image compression (`browser-image-compression`)
```

---

## 2. Backend Architecture (`backend/src/main/java/com/pitbox/`)

```text
backend/src/main/java/com/pitbox/
├── PitBoxApplication.java           # Spring Boot 3 main application entrypoint
├── config/
│   ├── SecurityConfig.java          # Spring Security filter chain, stateless JWT config, CORS
│   ├── WebConfig.java               # Web MVC configuration and static resource mapping
│   └── DevDataInitializer.java      # Development environment database seeder
├── controller/
│   ├── AuthController.java          # POST /api/auth/login, POST /api/auth/register, GET /api/auth/me
│   ├── VehicleController.java       # /api/vehicles CRUD, mileage updates, photo upload
│   ├── ServiceRecordController.java # /api/vehicles/{id}/services CRUD and timeline queries
│   ├── AttachmentController.java    # /api/vehicles/{id}/... attachment uploads, listing, and deletions
│   └── HealthController.java        # /api/health monitoring endpoint
├── dto/
│   ├── LoginRequest.java            # Credentials payload for authentication
│   ├── RegisterRequest.java         # Account registration payload
│   ├── AuthResponse.java            # JWT token and user info payload
│   ├── UserDto.java                 # User profile response data
│   ├── CreateVehicleRequest.java    # Vehicle creation payload with validation
│   ├── UpdateVehicleRequest.java    # Vehicle metadata update payload
│   ├── UpdateMileageRequest.java    # New odometer reading payload
│   ├── VehicleResponse.java         # Single vehicle response representation
│   ├── MileageLogResponse.java      # Mileage audit history entry response
│   ├── CreateServiceRecordRequest.java # Service record creation payload with nested items
│   ├── ServiceRecordResponse.java   # Service record response representation (including attachments)
│   ├── ServiceItemRequest.java      # Itemized line item request
│   ├── ServiceItemResponse.java     # Itemized line item response
│   └── AttachmentResponse.java      # Service record file attachment response DTO
├── exception/
│   ├── GlobalExceptionHandler.java  # @ControllerAdvice mapping domain exceptions to RFC7807/JSON
│   ├── EmailAlreadyExistsException.java
│   ├── InvalidCredentialsException.java
│   ├── InvalidMileageException.java
│   └── ResourceNotFoundException.java
├── model/
│   ├── User.java                    # JPA Entity: application users
│   ├── Vehicle.java                 # JPA Entity: user-owned vehicles
│   ├── MileageLog.java              # JPA Entity: immutable odometer audit log
│   ├── ServiceRecord.java           # JPA Entity: service history event
│   ├── ServiceItem.java             # JPA Entity: individual itemized service line item
│   └── Attachment.java              # JPA Entity: service record document & photo attachment
├── repository/
│   ├── UserRepository.java          # Spring Data JPA repository for User entity
│   ├── VehicleRepository.java       # Spring Data JPA repository for Vehicle entity
│   ├── MileageLogRepository.java    # Spring Data JPA repository for MileageLog entity
│   ├── ServiceRecordRepository.java # Spring Data JPA repository for ServiceRecord entity
│   └── AttachmentRepository.java    # Spring Data JPA repository for Attachment entity
├── security/
│   ├── JwtService.java              # JWT generation, token parsing, and expiration validation
│   ├── JwtAuthenticationFilter.java # OncePerRequestFilter extracting Bearer tokens
│   └── UserPrincipal.java           # Spring Security UserDetails implementation
└── service/
    ├── AuthService.java             # User registration, login verification, token issuance
    ├── VehicleService.java          # Vehicle business logic, forward-only odometer enforcement
    ├── ServiceRecordService.java    # Service entry management & mileage auto-advance
    ├── AttachmentService.java       # Multi-file attachment interface
    ├── AttachmentServiceImpl.java   # Attachment management & tenant verification implementation
    └── storage/
        ├── FileStorageService.java  # Abstract interface for media file storage
        └── LocalFileStorageService.java # Local filesystem storage implementation (/app/uploads)
```

---

## 3. Configuration & Infrastructure

```text
backend/src/main/resources/
├── application.yml                  # Base Spring Boot configuration
├── application-dev.yml              # Local development configuration profile
└── db/migration/
    ├── V1__initial_schema.sql       # Initial database schema (users, vehicles, mileage_logs, service_records, attachments)
    └── V2__seed_default_users.sql   # Default seed accounts for testing
docker-compose.yml                   # PostgreSQL, backend, and frontend multi-container stack
```
