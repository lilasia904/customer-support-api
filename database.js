

const { Database } = require("node:sqlite");
const path = require("node:path");
const fs = require("node:fs");

const dataDirectory = process.env.DATA_DIR || __dirname;

fs.mkdirSync(dataDirectory, {
  recursive: true
});

const db = new Database(
  path.join(dataDirectory, "tickets.db")
);

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    issue TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open'
  );
`);

console.log("Tickets database is ready!");

module.exports = db;
