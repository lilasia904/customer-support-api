
const session = require("express-session");
const db = require("./session-database");

class SQLiteSessionStore extends session.Store {
  constructor() {
    super();
  }

  get(sid, callback) {
    try {
      const row = db.prepare(
        "SELECT data, expires_at FROM sessions WHERE sid = ?"
      ).get(sid);

      if (!row) {
        return callback(null, null);
      }

      if (row.expires_at <= Date.now()) {
        db.prepare(
          "DELETE FROM sessions WHERE sid = ?"
        ).run(sid);

        return callback(null, null);
      }

      callback(null, JSON.parse(row.data));
    } catch (error) {
      callback(error);
    }
  }

  set(sid, sessionData, callback) {
    try {
      const expiresAt = this.getExpiration(sessionData);

      db.prepare(`
        INSERT INTO sessions (sid, data, expires_at)
        VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET
          data = excluded.data,
          expires_at = excluded.expires_at
      `).run(
        sid,
        JSON.stringify(sessionData),
        expiresAt
      );

      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  destroy(sid, callback) {
    try {
      db.prepare(
        "DELETE FROM sessions WHERE sid = ?"
      ).run(sid);

      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  touch(sid, sessionData, callback) {
    try {
      const expiresAt = this.getExpiration(sessionData);

      db.prepare(
        "UPDATE sessions SET expires_at = ? WHERE sid = ?"
      ).run(expiresAt, sid);

      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  getExpiration(sessionData) {
    const expires = sessionData.cookie?.expires;
    const timestamp = expires ? new Date(expires).getTime() : NaN;

    return Number.isFinite(timestamp)
      ? timestamp
      : Date.now() + 60 * 60 * 1000;
  }
}

module.exports = new SQLiteSessionStore();
