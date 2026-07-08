CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL,

    password_hash TEXT,

    role VARCHAR(50) NOT NULL DEFAULT 'user',

    status VARCHAR(50) NOT NULL DEFAULT 'active',

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ,

    UNIQUE (company_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_company_id
ON users (company_id);

CREATE INDEX IF NOT EXISTS idx_users_email
ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_status
ON users (status);

CREATE INDEX IF NOT EXISTS idx_users_deleted_at
ON users (deleted_at);