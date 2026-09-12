const bcrypt = require("bcrypt");

const pool = require("../config/db");
const authRepository = require("../repositories/auth.repository");

const register = async ({ firstName, lastName, email, phone, password }) => {
  const client = await pool.connect();

  try {
    // 1. Check existing user
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

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 3. Start transaction
    await client.query("BEGIN");

    // 4. Create user
    const user = await authRepository.createUser(client, {
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
    });

    // 5. Find CUSTOMER role
    const customerRole = await authRepository.findRoleByName(
      client,
      "CUSTOMER",
    );

    if (!customerRole) {
      const error = new Error("CUSTOMER role not found");

      error.statusCode = 500;

      throw error;
    }

    // 6. Assign CUSTOMER role
    await authRepository.assignRole(client, user.id, customerRole.id);

    // 7. Commit transaction
    await client.query("COMMIT");

    // 8. Return user
    return user;
  } catch (error) {
    // Rollback only if transaction started
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    throw error;
  } finally {
    // Connection pool me wapas
    client.release();
  }
};

module.exports = {
  register,
};
