CREATE TABLE roles (
    id SMALLSERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT roles_name_check
        CHECK (name IN ('CUSTOMER', 'DRIVER', 'ADMIN'))
);