-- Migration: 001_create_users
-- Creates the users table

CREATE TABLE IF NOT EXISTS users (
    id            UUID          NOT NULL PRIMARY KEY DEFAULT uuidv7(),
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
