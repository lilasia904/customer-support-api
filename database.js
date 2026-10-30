
const { Database } = require("node:sqlite");

const db = new Database("tickets.db");

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
