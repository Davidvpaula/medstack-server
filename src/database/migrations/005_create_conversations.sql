CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

    whatsapp_instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE SET NULL,

    status VARCHAR(50) NOT NULL DEFAULT 'open',

    channel VARCHAR(50) NOT NULL DEFAULT 'whatsapp',

    last_message_at TIMESTAMPTZ,

    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_conversations_company_id
ON conversations (company_id);

CREATE INDEX IF NOT EXISTS idx_conversations_contact_id
ON conversations (contact_id);

CREATE INDEX IF NOT EXISTS idx_conversations_instance_id
ON conversations (whatsapp_instance_id);

CREATE INDEX IF NOT EXISTS idx_conversations_status
ON conversations (status);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at
ON conversations (last_message_at);

CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at
ON conversations (deleted_at);