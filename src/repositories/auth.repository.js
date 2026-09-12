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

module.exports = {
  findUserByEmailOrPhone,
  createUser,
  findRoleByName,
  assignRole,
};
