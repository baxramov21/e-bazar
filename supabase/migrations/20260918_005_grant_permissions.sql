-- ============================================================
-- Migration: 005_grant_permissions
-- Bozor-Analitika MVP — Explicitly grant public schema permissions
-- ============================================================

-- Sometimes default privileges are not applied if tables are created via certain roles.
-- This ensures anon and authenticated roles have access to query the tables.
-- (Row Level Security will still protect the data itself).

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
