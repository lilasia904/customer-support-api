require("dotenv").config();

const sqliteDb = require("./database");
const pool = require("./postgres");

async function migrateTickets() {
  let client;

  try {
    // Read existing SQLite tickets
    const tickets = sqliteDb.prepare(
      "SELECT id, customer, issue, status FROM tickets ORDER BY id"
    ).all();

    console.log(`Found ${tickets.length} SQLite tickets.`);

    // Connect to Neon PostgreSQL
    client = await pool.connect();

    // Check whether PostgreSQL already contains tickets
    const existing = await client.query(
      "SELECT COUNT(*)::integer AS total FROM tickets"
    );

    if (existing.rows[0].total !== 0) {
      throw new Error(
        "Migration stopped: PostgreSQL already contains tickets."
      );
    }

    // Start a database transaction
    await client.query("BEGIN");

    // Transfer tickets while preserving their IDs
    for (const ticket of tickets) {
      await client.query(
        `INSERT INTO tickets (id, customer, issue, status)
         VALUES ($1, $2, $3, $4)`,
        [
          ticket.id,
          ticket.customer,
          ticket.issue,
          ticket.status
        ]
      );
    }

    // Make sure future ticket IDs continue after the highest ID
    if (tickets.length > 0) {
      await client.query(`
        SELECT setval(
          pg_get_serial_sequence('tickets', 'id'),
          (SELECT MAX(id) FROM tickets),
          true
        )
      `);
    }

    // Verify the number of transferred tickets
    const result = await client.query(
      "SELECT COUNT(*)::integer AS total FROM tickets"
    );

    if (result.rows[0].total !== tickets.length) {
      throw new Error(
        "Migration verification failed: ticket counts differ."
      );
    }

    // Save all changes
    await client.query("COMMIT");

    console.log(
      `Migration successful: ${result.rows[0].total} tickets transferred.`
    );

  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }

    console.error("Migration failed:", error.message);
    process.exitCode = 1;

  } finally {
    if (client) {
      client.release();
    }

    await pool.end();
  }
}

migrateTickets();