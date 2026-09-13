ALTER TABLE users
ALTER COLUMN status
SET DEFAULT 'PENDING_VERIFICATION';

ALTER TABLE users
DROP CONSTRAINT users_status_check;

ALTER TABLE users
ADD CONSTRAINT users_status_check
CHECK (
    status IN (
        'PENDING_VERIFICATION',
        'ACTIVE',
        'BLOCKED',
        'SUSPENDED',
        'DELETED'
    )
);