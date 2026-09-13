CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    channel VARCHAR(10) NOT NULL,

    purpose VARCHAR(30) NOT NULL,

    otp_hash TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    verified_at TIMESTAMPTZ,

    attempts INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_otp_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT otp_channel_check
        CHECK (channel IN ('EMAIL', 'PHONE')),

    CONSTRAINT otp_purpose_check
        CHECK (purpose IN ('REGISTRATION')),

    CONSTRAINT otp_attempts_check
        CHECK (attempts >= 0)
);

CREATE INDEX idx_otp_user_channel
ON otp_verifications(user_id, channel);

CREATE INDEX idx_otp_expiry
ON otp_verifications(expires_at);