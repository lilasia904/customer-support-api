const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Missing DATABASE_URL environment variable."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

module.exports = pool;