


const sqlite = require("node:sqlite");
const Database = sqlite.Database || sqlite.DatabaseSync;

const path = require("node:path");
const fs = require("node:fs");

const dataDirectory = process.env.DATA_DIR || __dirname;

fs.mkdirSync(dataDirectory, {
  recursive: true
});

const sessionDb = new Database(
  path.join(dataDirectory, "sessions.db")
);


sessionDb.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
`);



const deleteExpiredSessions = sessionDb.prepare(
  "DELETE FROM sessions WHERE expires_at <= ?"
);

function cleanupExpiredSessions() {
  try {
    const result = deleteExpiredSessions.run(Date.now());

    if (result.changes > 0) {
      console.log(
        `Cleaned up ${result.changes} expired sessions.`
      );
    }
  } catch (error) {
    console.error(
      "Session cleanup failed:",
      error
    );
  }
}

// Clean up when the server starts
cleanupExpiredSessions();

// Clean up every 15 minutes
const cleanupTimer = setInterval(
  cleanupExpiredSessions,
  15 * 60 * 1000
);

cleanupTimer.unref();



module.exports = sessionDb;
