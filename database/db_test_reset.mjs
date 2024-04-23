import postgres from "postgres";

process.env.POSTGRES_URL =
  "postgresql://postgres:postgres@localhost:5432/duostories_test_db";

// will use psql environment variables
const sql = postgres(process.env.POSTGRES_URL);

await sql`DELETE FROM users WHERE name = ${"user_new"}`;
await sql.end();
