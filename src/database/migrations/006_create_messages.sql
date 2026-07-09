CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

    whatsapp_instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE SET NULL,

    external_id VARCHAR(255),

    direction VARCHAR(50) NOT NULL,

    type VARCHAR(50) NOT NULL DEFAULT 'text',

    content TEXT,

    status VARCHAR(50) NOT NULL DEFAULT 'created',

    provider VARCHAR(50) NOT NULL DEFAULT 'baileys',

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    sent_at TIMESTAMPTZ,

    delivered_at TIMESTAMPTZ,

    read_at TIMESTAMPTZ,

    failed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_company_id
ON messages (company_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
ON messages (conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_contact_id
ON messages (contact_id);

CREATE INDEX IF NOT EXISTS idx_messages_external_id
ON messages (external_id);

CREATE INDEX IF NOT EXISTS idx_messages_direction
ON messages (direction);

CREATE INDEX IF NOT EXISTS idx_messages_status
ON messages (status);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
ON messages (created_at);

CREATE INDEX IF NOT EXISTS idx_messages_deleted_at
ON messages (deleted_at);