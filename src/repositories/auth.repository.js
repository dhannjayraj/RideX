const findUserByEmailOrPhone = async (client, email, phone) => {
  const result = await client.query(
    `
        SELECT id
        FROM users
        WHERE email = $1 OR phone = $2
        LIMIT 1
        `,
    [email, phone],
  );

  return result.rows[0] || null;
};

const createUser = async (
  client,
  { firstName, lastName, email, phone, passwordHash },
) => {
  const result = await client.query(
    `
        INSERT INTO users (
            first_name,
            last_name,
            email,
            phone,
            password_hash
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            first_name,
            last_name,
            email,
            phone,
            status,
            created_at
        `,
    [firstName, lastName || null, email, phone, passwordHash],
  );

  return result.rows[0];
};

const findRoleByName = async (client, roleName) => {
  const result = await client.query(
    `
        SELECT id, name
        FROM roles
        WHERE name = $1
        LIMIT 1
        `,
    [roleName],
  );

  return result.rows[0] || null;
};

const assignRole = async (client, userId, roleId) => {
  await client.query(
    `
        INSERT INTO user_roles (
            user_id,
            role_id
        )
        VALUES ($1, $2)
        `,
    [userId, roleId],
  );
};

const createOtpVerification = async (
  client,
  { userId, channel, purpose, otpHash, expiresAt },
) => {
  const result = await client.query(
    `
        INSERT INTO otp_verifications (
            user_id,
            channel,
            purpose,
            otp_hash,
            expires_at
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            user_id,
            channel,
            purpose,
            expires_at,
            created_at
        `,
    [userId, channel, purpose, otpHash, expiresAt],
  );

  return result.rows[0];
};

const findLatestValidOtp = async (client, userId, channel, purpose) => {
  const result = await client.query(
    `
        SELECT
            id,
            user_id,
            channel,
            purpose,
            otp_hash,
            expires_at,
            attempts,
            verified_at
        FROM otp_verifications
        WHERE user_id = $1
          AND channel = $2
          AND purpose = $3
          AND verified_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
        `,
    [userId, channel, purpose],
  );

  return result.rows[0] || null;
};

const incrementOtpAttempts = async (client, otpId) => {
  await client.query(
    `
        UPDATE otp_verifications
        SET attempts = attempts + 1
        WHERE id = $1
        `,
    [otpId],
  );
};

const markOtpVerified = async (client, otpId) => {
  await client.query(
    `
        UPDATE otp_verifications
        SET verified_at = NOW()
        WHERE id = $1
        `,
    [otpId],
  );
};

const markEmailVerified = async (client, userId) => {
  const result = await client.query(
    `
        UPDATE users
        SET
            is_email_verified = TRUE,
            updated_at = NOW()
        WHERE id = $1
        RETURNING
            id,
            is_email_verified,
            is_phone_verified,
            status
        `,
    [userId],
  );

  return result.rows[0] || null;
};

const markPhoneVerified = async (client, userId) => {
  const result = await client.query(
    `
        UPDATE users
        SET
            is_phone_verified = TRUE,
            updated_at = NOW()
        WHERE id = $1
        RETURNING
            id,
            is_email_verified,
            is_phone_verified,
            status
        `,
    [userId],
  );

  return result.rows[0] || null;
};

const activateUserIfFullyVerified = async (client, userId) => {
  const result = await client.query(
    `
        UPDATE users
        SET
            status = 'ACTIVE',
            updated_at = NOW()
        WHERE id = $1
          AND is_email_verified = TRUE
          AND is_phone_verified = TRUE
          AND status = 'PENDING_VERIFICATION'
        RETURNING
            id,
            first_name,
            last_name,
            email,
            phone,
            is_email_verified,
            is_phone_verified,
            status,
            created_at
        `,
    [userId],
  );

  return result.rows[0] || null;
};

module.exports = {
  findUserByEmailOrPhone,
  createUser,
  findRoleByName,
  assignRole,
  createOtpVerification,
  findLatestValidOtp,
  incrementOtpAttempts,
  markOtpVerified,
  markEmailVerified,
  markPhoneVerified,
  activateUserIfFullyVerified
};
