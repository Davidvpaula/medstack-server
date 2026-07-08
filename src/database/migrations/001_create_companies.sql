CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(255) NOT NULL,

    slug VARCHAR(120) NOT NULL UNIQUE,

    status VARCHAR(50) NOT NULL DEFAULT 'active',

    plan VARCHAR(50) NOT NULL DEFAULT 'free',

    document VARCHAR(50),

    email VARCHAR(255),

    phone VARCHAR(50),

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_companies_slug
ON companies (slug);

CREATE INDEX IF NOT EXISTS idx_companies_status
ON companies (status);

CREATE INDEX IF NOT EXISTS idx_companies_deleted_at
ON companies (deleted_at);