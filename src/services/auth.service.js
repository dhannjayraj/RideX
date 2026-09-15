const bcrypt = require("bcrypt");

const pool = require("../config/db");
const authRepository = require("../repositories/auth.repository");

const { generateOtp } = require("../utils/otp");

const register = async ({ firstName, lastName, email, phone, password }) => {
  const client = await pool.connect();

  try {
    // Start transaction
    await client.query("BEGIN");

    // Check existing user
    const existingUser = await authRepository.findUserByEmailOrPhone(
      client,
      email,
      phone,
    );

    if (existingUser) {
      const error = new Error("Email or phone already registered");

      error.statusCode = 409;

      throw error;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await authRepository.createUser(client, {
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
    });

    // Find CUSTOMER role
    const customerRole = await authRepository.findRoleByName(
      client,
      "CUSTOMER",
    );

    if (!customerRole) {
      const error = new Error("CUSTOMER role not found");

      error.statusCode = 500;

      throw error;
    }

    // Assign CUSTOMER role
    await authRepository.assignRole(client, user.id, customerRole.id);

    // Generate OTPs
    const emailOtp = generateOtp();
    const phoneOtp = generateOtp();

    // Hash OTPs
    const emailOtpHash = await bcrypt.hash(emailOtp, 10);

    const phoneOtpHash = await bcrypt.hash(phoneOtp, 10);

    // OTP expiry - 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save email OTP
    await authRepository.createOtpVerification(client, {
      userId: user.id,
      channel: "EMAIL",
      purpose: "REGISTRATION",
      otpHash: emailOtpHash,
      expiresAt,
    });

    // Save phone OTP
    await authRepository.createOtpVerification(client, {
      userId: user.id,
      channel: "PHONE",
      purpose: "REGISTRATION",
      otpHash: phoneOtpHash,
      expiresAt,
    });

    // Commit transaction
    await client.query("COMMIT");

    // Development only
    console.log("Email OTP:", emailOtp);
    console.log("Phone OTP:", phoneOtp);

    return {
      user,
      verificationRequired: true,
    };
  } catch (error) {
    // Rollback transaction
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
};

// const verifyEmailOtp = async ({ userId, otp }) => {
//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     const otpRecord = await authRepository.findLatestValidOtp(
//       client,
//       userId,
//       "EMAIL",
//       "REGISTRATION",
//     );

//     if (!otpRecord) {
//       const error = new Error("OTP not found or already verified");

//       error.statusCode = 400;

//       throw error;
//     }

//     // OTP expiry check
//     if (new Date(otpRecord.expires_at) <= new Date()) {
//       const error = new Error("OTP has expired");

//       error.statusCode = 400;

//       throw error;
//     }

//     // Maximum attempts
//     if (otpRecord.attempts >= 5) {
//       const error = new Error("Maximum OTP attempts exceeded");

//       error.statusCode = 429;

//       throw error;
//     }

//     // Compare entered OTP with hashed OTP
//     const isValidOtp = await bcrypt.compare(otp, otpRecord.otp_hash);

//     if (!isValidOtp) {
//       await authRepository.incrementOtpAttempts(client, otpRecord.id);

//       const error = new Error("Invalid OTP");

//       error.statusCode = 400;

//       throw error;
//     }

//     // Mark OTP as verified
//     await authRepository.markOtpVerified(client, otpRecord.id);

//     // Mark email as verified
//     const user = await authRepository.markEmailVerified(client, userId);

//     await client.query("COMMIT");

//     return user;
//   } catch (error) {
//     await client.query("ROLLBACK");

//     throw error;
//   } finally {
//     client.release();
//   }
// };

const verifyEmailOtp = async ({ userId, otp }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const otpRecord = await authRepository.findLatestValidOtp(
      client,
      userId,
      "EMAIL",
      "REGISTRATION",
    );

    if (!otpRecord) {
      const error = new Error("OTP not found or already verified");

      error.statusCode = 400;
      throw error;
    }

    if (new Date(otpRecord.expires_at) <= new Date()) {
      const error = new Error("OTP has expired");

      error.statusCode = 400;
      throw error;
    }

    if (otpRecord.attempts >= 5) {
      const error = new Error("Maximum OTP attempts exceeded");

      error.statusCode = 429;
      throw error;
    }

    const isValidOtp = await bcrypt.compare(otp, otpRecord.otp_hash);

    // if (!isValidOtp) {
    //   await authRepository.incrementOtpAttempts(client, otpRecord.id);

    //   await client.query("COMMIT");

    //   const error = new Error("Invalid OTP");

    //   error.statusCode = 400;

    //   throw error;
    // }

    if (!isValidOtp) {
      await authRepository.incrementOtpAttempts(client, otpRecord.id);

      await client.query("COMMIT");

      const error = new Error("Invalid OTP");
      error.statusCode = 400;

      throw error;
    }

    await authRepository.markOtpVerified(client, otpRecord.id);

    const user = await authRepository.markEmailVerified(client, userId);

    await client.query("COMMIT");

    return user;
  } catch (error) {
    // Only rollback if transaction is still active
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      // Transaction may already have been committed
    }

    throw error;
  } finally {
    client.release();
  }
};

// const verifyPhoneOtp = async ({ userId, otp }) => {
//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     const otpRecord = await authRepository.findLatestValidOtp(
//       client,
//       userId,
//       "PHONE",
//       "REGISTRATION",
//     );

//     if (!otpRecord) {
//       const error = new Error("OTP not found or already verified");

//       error.statusCode = 400;
//       throw error;
//     }

//     // Check expiry
//     if (new Date(otpRecord.expires_at) <= new Date()) {
//       const error = new Error("OTP has expired");

//       error.statusCode = 400;
//       throw error;
//     }

//     // Check attempts
//     if (otpRecord.attempts >= 5) {
//       const error = new Error("Maximum OTP attempts exceeded");

//       error.statusCode = 429;
//       throw error;
//     }

//     // Compare OTP
//     const isValidOtp = await bcrypt.compare(otp, otpRecord.otp_hash);

//     if (!isValidOtp) {
//       await authRepository.incrementOtpAttempts(client, otpRecord.id);

//       const error = new Error("Invalid OTP");

//       error.statusCode = 400;
//       throw error;
//     }

//     // Mark OTP verified
//     await authRepository.markOtpVerified(client, otpRecord.id);

//     // Mark phone verified
//     await authRepository.markPhoneVerified(client, userId);

//     // Activate only if BOTH verified
//     const user = await authRepository.activateUserIfFullyVerified(
//       client,
//       userId,
//     );

//     await client.query("COMMIT");

//     return user;
//   } catch (error) {
//     await client.query("ROLLBACK");
//     throw error;
//   } finally {
//     client.release();
//   }
// };

const verifyPhoneOtp = async ({ userId, otp }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const otpRecord = await authRepository.findLatestValidOtp(
      client,
      userId,
      "PHONE",
      "REGISTRATION",
    );

    if (!otpRecord) {
      const error = new Error("OTP not found or already verified");

      error.statusCode = 400;
      throw error;
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) <= new Date()) {
      const error = new Error("OTP has expired");

      error.statusCode = 400;
      throw error;
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      const error = new Error("Maximum OTP attempts exceeded");

      error.statusCode = 429;
      throw error;
    }

    // Compare OTP
    const isValidOtp = await bcrypt.compare(otp, otpRecord.otp_hash);

    // if (!isValidOtp) {
    //   await authRepository.incrementOtpAttempts(client, otpRecord.id);

    //   await client.query("COMMIT");

    //   const error = new Error("Invalid OTP");

    //   error.statusCode = 400;

    //   throw error;
    // }

    if (!isValidOtp) {
      await authRepository.incrementOtpAttempts(client, otpRecord.id);

      await client.query("COMMIT");

      const error = new Error("Invalid OTP");
      error.statusCode = 400;

      throw error;
    }

    // Mark OTP verified
    await authRepository.markOtpVerified(client, otpRecord.id);

    // Mark phone verified
    await authRepository.markPhoneVerified(client, userId);

    // Activate only if BOTH verified
    const user = await authRepository.activateUserIfFullyVerified(
      client,
      userId,
    );

    await client.query("COMMIT");

    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const resendOtp = async ({ userId, channel }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const purpose = "REGISTRATION";

    if (!["EMAIL", "PHONE"].includes(channel)) {
      const error = new Error("Invalid OTP channel");

      error.statusCode = 400;
      throw error;
    }

    // Lock user row
    const userResult = await client.query(
      `
            SELECT
                id,
                email,
                phone,
                is_email_verified,
                is_phone_verified,
                status
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
      [userId],
    );

    const user = userResult.rows[0];

    if (!user) {
      const error = new Error("User not found");

      error.statusCode = 404;
      throw error;
    }

    // Already verified?
    if (channel === "EMAIL" && user.is_email_verified) {
      const error = new Error("Email is already verified");

      error.statusCode = 400;
      throw error;
    }

    if (channel === "PHONE" && user.is_phone_verified) {
      const error = new Error("Phone is already verified");

      error.statusCode = 400;
      throw error;
    }

    // 60 second cooldown
    const secondsSinceLastOtp = await authRepository.getSecondsSinceLastOtp(
      client,
      userId,
      channel,
      purpose,
    );

    if (secondsSinceLastOtp !== null && secondsSinceLastOtp < 60) {
      const remainingSeconds = Math.ceil(60 - secondsSinceLastOtp);

      const error = new Error(
        `Please wait ${remainingSeconds} seconds before requesting another OTP`,
      );

      error.statusCode = 429;
      throw error;
    }

    // Maximum 5 resends per hour
    const recentResendCount = await authRepository.countRecentResends(
      client,
      userId,
      channel,
      purpose,
    );

    if (recentResendCount >= 5) {
      const error = new Error(
        "Maximum OTP resend limit exceeded. Please try again later.",
      );

      error.statusCode = 429;
      throw error;
    }

    // Invalidate previous OTP
    await authRepository.invalidateActiveOtps(client, userId, channel, purpose);

    // Generate new OTP
    const otp = generateOtp();

    // Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // 5 minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save new OTP
    await authRepository.createOtpVerification(client, {
      userId,
      channel,
      purpose,
      otpHash,
      expiresAt,
      resendCount: 1,
    });

    await client.query("COMMIT");

    // Development only
    console.log(`${channel} RESEND OTP:`, otp);

    return {
      message: "OTP resent successfully",
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {}

    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  register,
  verifyEmailOtp,
  verifyPhoneOtp,
  resendOtp
};
