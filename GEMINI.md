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


## 4. Modular Documentation Architecture & Maintenance Rule

Do NOT bloat single markdown files into monoliths. Documentation must follow a structured, multi-file modular layout under `docs/` indexed by `docs/README.md`.

### Required Directory Layout:
```text
docs/
├── README.md                 # Full documentation index & table of contents
├── architecture.md           # System design, high-level stack, and RAM limits
├── database.md               # DB ERD schema, table definitions, and Flyway rules
├── api-reference.md          # REST API endpoints, DTO contracts, and error responses
├── security-auth.md          # JWT auth flow, BCrypt, permissions, and tenant isolation
└── features/                 # Dedicated specifications for core domain subsystems
    ├── mileage-engine.md     # Forward-only odometer sync & audit logs
    ├── reminders.md          # Dynamic interval rules (mileage, date, overdue statuses)
    ├── media-upload.md       # Client-side image compression & FileStorageService
    └── tco-statistics.md     # Total cost calculation & Recharts analytics

```

### Documentation Workflow for Every Substantial Feature:

Whenever a new feature is added, modified, or refactored:

1. **Create or Update Subsystem Docs:**
* Add/edit the dedicated markdown file under `docs/features/<feature-name>.md` detailing its behavior, business rules, edge cases, and interfaces.


2. **Synchronize Contracts:**
* Update `docs/api-reference.md` and `docs/database.md` if routes, DTOs, or Flyway migrations were introduced.

3. **Maintain the Root Index:**
* Ensure the new or updated document is clearly linked and described in `docs/README.md`.

4. **Completion Gate:**
* A task cannot be marked as `DONE` in `docs/plans/task.md` without citing the corresponding documentation files created or updated in `docs/`.
