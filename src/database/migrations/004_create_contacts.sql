CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    name VARCHAR(255),

    phone VARCHAR(50) NOT NULL,

    email VARCHAR(255),

    source VARCHAR(50) NOT NULL DEFAULT 'whatsapp',

    status VARCHAR(50) NOT NULL DEFAULT 'active',

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ,

    UNIQUE (company_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_contacts_company_id
ON contacts (company_id);

CREATE INDEX IF NOT EXISTS idx_contacts_phone
ON contacts (phone);

CREATE INDEX IF NOT EXISTS idx_contacts_status
ON contacts (status);

CREATE INDEX IF NOT EXISTS idx_contacts_deleted_at
ON contacts (deleted_at);