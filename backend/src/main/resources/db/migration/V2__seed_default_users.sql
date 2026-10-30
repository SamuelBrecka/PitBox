-- V2: Seed Default User and Admin User
INSERT INTO users (id, email, password_hash, full_name, role, created_at)
VALUES
    (gen_random_uuid(), 'user@pitbox.io', '$2a$10$eNYMyB159okOIrp2zYOK3u6.cYcLeyGL.PBVaMjXtdbqwSBqibt9O', 'Default User', 'ROLE_USER', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'admin@pitbox.io', '$2a$10$bxhSH1Va4V72f8dC67pU3u/fd7QbL9AWI6W4hekiNUxCgRFvoBaGO', 'Admin User', 'ROLE_ADMIN', CURRENT_TIMESTAMP);