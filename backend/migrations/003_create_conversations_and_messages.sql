-- Migration: 003_create_conversations_and_messages
-- Creates conversations and messages tables

CREATE TABLE IF NOT EXISTS conversations (
    id              UUID          NOT NULL PRIMARY KEY DEFAULT uuidv7(),
    user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255)  NULL,
    pending         BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id
    ON conversations(user_id);

CREATE TABLE IF NOT EXISTS messages (
    id              UUID          NOT NULL PRIMARY KEY DEFAULT uuidv7(),
    conversation_id UUID          NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            VARCHAR(16)   NOT NULL,
    content         TEXT          NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
    ON messages(conversation_id);
