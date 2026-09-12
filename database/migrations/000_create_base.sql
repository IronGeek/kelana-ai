-- Migration: 001_create_users
-- Creates the users table

CREATE TYPE IF NOT EXISTS "account_role_enum" AS ENUM ('system', 'admin', 'user');

CREATE TABLE IF NOT EXISTS "account" (
    id              UUID              NOT NULL PRIMARY KEY DEFAULT uuidv7(),
    name            VARCHAR(100)      NOT NULL,
    email           VARCHAR(255)      NOT NULL UNIQUE,
    email_verified  BOOLEAN           NOT NULL DEFAULT FALSE,
    phone_number    VARCHAR(15)       NULL,
    phone_verified  BOOLEAN           NOT NULL DEFAULT FALSE,
    password_hash   VARCHAR(255)      NOT NULL,
    role            account_role_enum NOT NULL,
    avatar_url      VARCHAR(255)      NULL,
    avatar_provider VARCHAR(10)       NULL,
    about           VARCHAR(255)      NULL,
    last_login      TIMESTAMPTZ       NULL
    last_logout     TIMESTAMPTZ       NULL
    created_at      TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ       NULL
);

CREATE TABLE IF NOT EXISTS "trip" (
    id              UUID              NOT NULL PRIMARY KEY DEFAULT uuidv7(),
    account_id      UUID              NOT NULL,
    destination     VARCHAR(100)      NOT NULL,
    days            INTEGER           NOT NULL,
    budget          NUMERIC(10,2)     NOT NULL,
    daily_budget    NUMERIC(10,2)     GENERATED ALWAYS AS (budget / days) STORED,
    category        VARCHAR(15)       NOT NULL,
    styles          TEXT[]            NOT NULL DEFAULT ARRAY[]::text[],
    recommendation  TEXT              NULL,
    pending         BOOLEAN           NOT NULL DEFAULT FALSE,
    error           TEXT              NULL,
    created_at      TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ       NULL,

    CONSTRAINT trip_account_id_fkey FOREIGN KEY (account_id)
        REFERENCES "account" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_trip_account_id
    ON trip(account_id);

CREATE TABLE IF NOT EXISTS "conversation" (
    id              UUID          NOT NULL PRIMARY KEY DEFAULT uuidv7(),
    account_id      UUID          NOT NULL,
    title           VARCHAR(255)  NULL,
    pending         BOOLEAN       NOT NULL DEFAULT FALSE,
    error           TEXT          NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NULL,

    CONSTRAINT conversation_account_id_fkey FOREIGN KEY (account_id)
        REFERENCES "account" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conversation_account_id
    ON conversation(account_id);

CREATE TABLE IF NOT EXISTS "message" (
    id              UUID          NOT NULL PRIMARY KEY DEFAULT uuidv7(),
    conversation_id UUID          NOT NULL,
    role            VARCHAR(15)   NOT NULL,
    content         TEXT          NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NULL,

    CONSTRAINT message_conversation_id_fkey FOREIGN KEY (conversation_id)
        REFERENCES "conversation" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_message_conversation_id
    ON message(conversation_id);

CREATE TABLE IF NOT EXISTS "metric" (
  id              UUID              NOT NULL PRIMARY KEY DEFAULT uuidv7(),
  service_name    VARCHAR(25)       NOT NULL,
  correlated_id   UUID              NOT NULL,
  input_tokens    INTEGER           NOT NULL DEFAULT 0,
  output_tokens   INTEGER           NOT NULL DEFAULT 0,
  total_tokens    INTEGER           NOT NULL DEFAULT 0,
  exec_start      DOUBLE PRECISION  NOT NULL DEFAULT 0,
  exec_time       DOUBLE PRECISION  NOT NULL DEFAULT 0,
  system          TEXT              NULL,
  prompt          TEXT              NULL,
  response        TEXT              NULL,
  success         BOOLEAN           NOT NULL DEFAULT FALSE,
  error           TEXT              NULL,
  created_by      UUID              NOT NULL,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_by      UUID              NULL,
  updated_at      TIMESTAMPTZ       NULL
)
