# PitBox Documentation Index

Welcome to the PitBox technical documentation suite.

## System & Architecture
- [System Architecture](architecture.md): High-level system design, low-memory budget (< 400 MB), and Docker orchestration
- [Build & Run Guide](run-and-build.md): Local development, compilation commands, and Docker execution
- [Database & Migrations](database.md): PostgreSQL 16 schema, Flyway migrations, and relational constraints
- [REST API Reference](api-reference.md): Endpoint specs, request/response DTO contracts, and status codes
- [Authentication & Security](auth-and-security.md): Stateless JWT workflow, BCrypt hashing, and tenant isolation

## Core Features
- [UI/UX Minimalist Design System](features/ui-design-system.md): Light alabaster palette, Swiss-inspired minimal layout for Landing and Garage pages
- [Mileage Engine](features/mileage-engine.md): Forward-only odometer updates and audit logging (`MILEAGE_LOGS`)
- [Media & Storage](features/media-upload.md): Client-side image compression and `FileStorageService` abstraction
- [Reminders & Service Intervals](features/reminders.md): Dynamic interval calculation and status tracking *(Planned)*
- [TCO Statistics](features/tco-statistics.md): Cost analytics, ownership metrics, and Recharts integration *(Planned)*

---
*For active development tracking and execution plans, see [docs/plans/task.md](plans/task.md).*
