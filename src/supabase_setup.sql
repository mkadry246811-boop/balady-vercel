-- Supabase Setup Script for Ajeer & Health Systems
-- This script creates the necessary tables for both systems.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Ajeer Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_type TEXT DEFAULT 'تعاقد أجير',
    contract_number TEXT UNIQUE,
    worker_name TEXT,
    worker_profession TEXT,
    worker_id_number TEXT,
    worker_nationality TEXT,
    provider_entity TEXT,
    provider_hr_id TEXT,
    beneficiary_entity TEXT,
    beneficiary_hr_id TEXT,
    contract_summary TEXT,
    start_date TEXT,
    end_date TEXT,
    work_locations TEXT,
    is_blocked BOOLEAN DEFAULT false,
    blocked_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Health Certificates Table
CREATE TABLE IF NOT EXISTS health_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number TEXT,
    issue_date TEXT,
    issuer TEXT,
    expiry_date TEXT,
    holder_name TEXT,
    holder_id TEXT,
    gender TEXT,
    nationality TEXT,
    profession TEXT,
    program_name TEXT,
    program_end_date TEXT,
    facility_name TEXT,
    facility_license TEXT,
    photo_url TEXT,
    is_disabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS (Optional - Keep disabled for simple initial connectivity)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_certi���q�^