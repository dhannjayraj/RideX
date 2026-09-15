ALTER TABLE otp_verifications
ADD COLUMN invalidated_at TIMESTAMPTZ;

ALTER TABLE otp_verifications
ADD COLUMN resend_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE otp_verifications
ADD CONSTRAINT otp_resend_count_check
CHECK (resend_count >= 0);

CREATE INDEX idx_otp_resend_lookup
ON otp_verifications(user_id, channel, purpose, created_at DESC);