# PitBox – Project Instructions & System Guidelines

## 1. Project Overview & Architecture
PitBox is a lightweight digital service logbook for vehicle owners.
Detailed system design, relational database schemas (ERD), and UI flows are documented at [docs/architecture.md](docs/architecture.md).

- **Backend:** Spring Boot 3 (Java 21), Spring Data JPA, Flyway migrations, Spring Security (stateless JWT), PostgreSQL 16.
- **Frontend:** React 18+ (TypeScript, Vite), Tailwind CSS using PitBox brand tokens, `browser-image-compression`, TanStack Query, React Hook Form + Zod, Recharts.
- **Infrastructure:** Docker Compose (PostgreSQL Alpine, Spring Boot backend with `-Xmx256m`, Nginx static frontend). Target budget: **< 400 MB RAM total**.
- **Storage:** Abstracted `FileStorageService` (default `LocalFileStorageService` persisting to Docker volume `/app/uploads`).

## 2. Autonomous Development Workflow
All feature implementations, database migrations, UI enhancements, and bugfixes MUST be executed via the dedicated **`/dev-cycle`** skill (`.agent/skills/dev-cycle/SKILL.md`).

- Follow the specialized agent lifecycle defined in the skill: **Architect** (Plan/Contracts) ➔ **Designer** (UI/Tokens) ➔ **Coder** (Full-Stack Implementation) ➔ **Tester** (Deterministic Self-Healing Verification).
- Always record and update active work in [docs/plans/task.md](docs/plans/task.md).

## 3. Strict Domain & Engineering Invariants

1. **Mileage Forward-Only Update:**
   - Any service entry or manual odometer adjustment updates `VEHICLES.current_mileage` ONLY IF `new_mileage > current_mileage`.
   - An audit entry in `MILEAGE_LOGS` must ALWAYS be recorded on any odometer change.
2. **Dynamic Reminder Calculations:**
   - Compute statuses strictly on demand (`OVERDUE`, `DUE_SOON`, `OK`).
   - Marking a service record as satisfying a reminder must automatically advance the next scheduled target (`interval_mileage`, `interval_months`).
3. **Data Isolation (Tenant Security):**
   - Every database query and write operation must resolve and enforce `user_id` strictly from the authenticated JWT context (`SecurityContextHolder`). Never trust client-supplied user IDs.
4. **Client-Side Asset Compression:**
   - Compress user vehicle photos and service invoice receipts in the browser via `browser-image-compression` (~8 MB down to ~200 KB) prior to multipart upload.
5. **Brand Design System:**
   - Maintain strict UI consistency using the PitBox palette:
     - `#3368A0` (Deep Steel Blue: Sidebar navigation, primary CTAs)
     - `#66A3BF` (Glacier Sky Blue: Gauges, secondary actions, chart accents)
     - `#C8DFDB` (Soft Seafoam Mint: Metric gauge panels, timeline headers, pill badges)
     - `#F2EFE7` (Warm Cream: Viewport base canvas)
6. **Database Evolution:**
   - All relational schema alterations must be managed strictly through forward-only Flyway SQL migrations (`src/main/resources/db/migration/V{version}__{description}.sql`).


## 4. Mandatory Feature Documentation Rule

Whenever implementing or refactoring a substantial feature (e.g., new domain entities, new API endpoints, auth flows, calculation engines, UI views, or storage integrations):

1. **Update `docs/architecture.md`:**
   - Synchronize the API specification tables, DTO schemas, and Mermaid ERD/flowcharts with actual implementation.
   - Document any new environment variables or architectural trade-offs.
2. **Dedicated Documentation for Complex Subsystems:**
   - If introducing complex modules (such as interval scheduling algorithms, compression utilities, or external proxies), provide a dedicated markdown specification under `docs/` detailing its behavior, edge cases, and interfaces.
3. **Task Completion Requirement:**
   - A task cannot be marked as `DONE` in `docs/plans/task.md` without referencing the updated documentation along with passing test evidence.