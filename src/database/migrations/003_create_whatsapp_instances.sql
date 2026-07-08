CREATE TABLE IF NOT EXISTS whatsapp_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    instance_key VARCHAR(120) NOT NULL,

    provider VARCHAR(50) NOT NULL DEFAULT 'baileys',

    status VARCHAR(50) NOT NULL DEFAULT 'idle',

    phone VARCHAR(50),

    display_name VARCHAR(255),

    session_status VARCHAR(50) NOT NULL DEFAULT 'disconnected',

    last_connected_at TIMESTAMPTZ,

    last_disconnected_at TIMESTAMPTZ,

    last_error TEXT,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ,

    UNIQUE (company_id, instance_key)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_company_id
ON whatsapp_instances (company_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_instance_key
ON whatsapp_instances (instance_key);

CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_status
ON whatsapp_instances (status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_session_status
ON whatsapp_instances (session_status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_deleted_at
ON whatsapp_instances (deleted_at);