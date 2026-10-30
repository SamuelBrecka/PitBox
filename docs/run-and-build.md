# PitBox Build & Run Guide

This guide details how to compile, test, and run the PitBox application across local development and containerized environments.

---

## 1. Environment Configuration

Copy the example environment configuration into `.env` (already created if cloned with workspace setup):
```bash
cp .env.example .env
```

Ensure standard variables are populated:
- `POSTGRES_DB=pitbox`
- `POSTGRES_USER=pitbox`
- `POSTGRES_PASSWORD=pitbox_secure_password_change_me`
- `POSTGRES_PORT=5432`
- `JWT_SECRET=PitBoxDefaultStaticFallbackJwtSecretForDevelopmentAndLocalTestingKey2026!`
- `BACKEND_PORT=8080`
- `FRONTEND_PORT=80`
- `UPLOAD_DIR=/app/uploads`

---

## 2. Option A: Run via Docker Compose (Recommended for Full Stack)

Requires Docker Desktop or Docker engine running.

```bash
# Build and start all services (PostgreSQL, Backend, Frontend reverse proxy)
docker compose up --build

# Or run detached in background:
docker compose up -d --build
```

- **Frontend Application:** [http://localhost](http://localhost) (Port 80)
- **Backend API & Health:** [http://localhost:8080/api/health](http://localhost:8080/api/health)
- **PostgreSQL Database:** Port 5432

To stop services:
```bash
docker compose down
```

---

## 3. Option B: Local Development Run (Zero-Docker / Standalone)

You can run the backend and frontend directly on your host machine.

### Backend (Spring Boot 3 / Java 21)
You can run using the Maven Wrapper directly from root:

**With In-Memory H2 Dev Profile (Zero External Database Required):**
```powershell
# Windows
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"

# Linux / macOS
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**With Local PostgreSQL:**
Ensure PostgreSQL is active on port 5432, then run:
```powershell
.\mvnw.cmd spring-boot:run
```
The backend initializes on [http://localhost:8080](http://localhost:8080) and applies Flyway migrations automatically.

### Frontend (React 18 + Vite)
```powershell
# Install dependencies (from root or frontend directory)
npm --prefix frontend install

# Start Vite dev server with proxy to backend (http://localhost:8080)
npm run dev
# Or from frontend folder:
cd frontend
npm run dev
```
The frontend dev server starts on [http://localhost:3000](http://localhost:3000).

---

## 4. Compilation & Verification Commands

### Frontend Verification
```powershell
npm run lint          # ESLint with 0 warnings
npm run build         # TypeScript type-check and Vite production build
npm test              # Vitest test suite
```

### Backend Verification
```powershell
.\mvnw.cmd test-compile             # Verify compilation of production and test classes
.\mvnw.cmd test                     # Run all JUnit 5 test suites
.\mvnw.cmd package -DskipTests       # Generate executable Spring Boot jar
```


---

## 5. Default Seeded Accounts
When the database builds or rebuilds, default accounts are seeded:
- **Default User:** `user@pitbox.io` / `password123` (Role: `ROLE_USER`)
- **Admin User:** `admin@pitbox.io` / `admin123` (Role: `ROLE_ADMIN`)
