# PitBox – Project Instructions & Agent Guidelines

## 1. Project Overview & Architecture
PitBox is a lightweight digital service logbook for vehicle owners.
Detailed architecture, DB ERD, and wireflows are located at [docs/architecture.md](file:///c:/Users/brecka/source/repos/PitBox/docs/architecture.md).

- **Backend:** Spring Boot 3 (Java 21), Spring Data JPA, Flyway migrations, Spring Security (stateless JWT), PostgreSQL 16.
- **Frontend:** React + TypeScript + Vite, Tailwind CSS with PitBox color palette (`#3368A0`, `#66A3BF`, `#C8DFDB`, `#F2EFE7`), `browser-image-compression`, TanStack Query, React Hook Form + Zod, Recharts.
- **Infrastructure:** Docker Compose (PostgreSQL, Spring Boot backend, Nginx frontend). Resource target: < 400 MB RAM footprint.
- **Storage:** Pluggable `FileStorageService` (default `LocalFileStorageService` saving to volume `/uploads`).

---

## 2. Agent Autonomous Dev Loop (Protocol)

Every feature or bugfix request must proceed strictly through the 4-phase loop:

```
[Request] -> [1. Architect / Plan] -> [2. Coder / Implement] -> [3. Tester / Verify] <----+
                                                                      |                   | (on failure, max 3x)
                                                                      +--(fail)-----------+
                                                                      |
                                                                      +--(pass)--> [4. Document / Review]
```

### Phase 1: Architect / Plan
- Inspect relevant repository files and [docs/architecture.md](file:///c:/Users/brecka/source/repos/PitBox/docs/architecture.md).
- Formulate an implementation plan in `docs/plans/task.md` or a targeted step plan before modifying code.
- Check database schema changes: all DB modifications MUST use a new sequential Flyway migration script (`V...__description.sql`).

### Phase 2: Coder / Implement
- Implement minimal, idiomatic code adhering to the tech stack.
- Respect business logic invariants:
  1. **Mileage Synchronization:** New service mileage updates `vehicle.current_mileage` ONLY IF `service.mileage > vehicle.current_mileage`. Always append to `mileage_logs`.
  2. **Reminder State:** Compute status dynamically (`OVERDUE`, `DUE_SOON`, `OK`). Auto-reset intervals on matching completed service.
  3. **Data Isolation:** All operations enforce `vehicle.user_id == current_user_id`.
  4. **Frontend Compression:** Client-side compression for vehicle photos and receipts before upload.

### Phase 3: Tester / Verify & Feedback Loop
- Run verification command using the MCP tool `run_safe_command` (or terminal runner):
  - Backend: `./mvnw test` (or `mvn test`)
  - Frontend: `npm run lint`, `npx tsc --noEmit`, `npm test`
- **If tests or builds fail:**
  - Capture exact stack trace / compiler error.
  - Hand back to Phase 2 (Coder) with exact error analysis.
  - Automatically re-test (max 3 retry cycles).
- **If tests pass:** Proceed to Phase 4.

### Phase 4: Document & Finish
- Update [docs/plans/task.md](file:///c:/Users/brecka/source/repos/PitBox/docs/plans/task.md).
- Provide a concise summary of changes and verification evidence.
