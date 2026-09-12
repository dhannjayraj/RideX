CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),

    email CITEXT UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ,

    CONSTRAINT users_status_check
        CHECK (status IN ('ACTIVE', 'BLOCKED', 'SUSPENDED', 'DELETED')),

    CONSTRAINT users_email_check
        CHECK (POSITION('@' IN email::TEXT) > 1)
);