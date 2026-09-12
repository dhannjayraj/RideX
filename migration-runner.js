const fs = require("fs");
const path = require("path");
const pool = require("./src/config/db");

const migrationsPath = path.join(__dirname, "migrations");

const runMigrations = async () => {
  const client = await pool.connect();

  try {
    // 1. Migration tracking table creation
    await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

    // 2. Read files of migration folder
    const files = fs
      .readdirSync(migrationsPath)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // 3. Find the previously executed migrations 
    const result = await client.query(`
            SELECT migration_name
            FROM schema_migrations
        `);

    const executedMigrations = result.rows.map((row) => row.migration_name);

    // 4. Check all the migration
    for (const file of files) {
      if (executedMigrations.includes(file)) {
        console.log(`SKIPPED: ${file}`);
        continue;
      }

      console.log(`RUNNING: ${file}`);

      const filePath = path.join(migrationsPath, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      // Transaction start
      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          `
                    INSERT INTO schema_migrations (migration_name)
                    VALUES ($1)
                    `,
          [file],
        );

        await client.query("COMMIT");

        console.log(`SUCCESS: ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("All migrations completed.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
