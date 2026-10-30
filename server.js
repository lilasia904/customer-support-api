
const express = require("express");

const app = express();

const db = require("./database");


app.use(express.json());

app.use("/tracker", express.static("public"));



app.get("/", function(req, res) {
  res.send("Welcome to my Customer Support API!");
});


app.post("/api/tickets", function(req, res) {
  const customer = req.body?.customer;
  const issue = req.body?.issue;

  if (
    typeof customer !== "string" ||
    !customer.trim() ||
    typeof issue !== "string" ||
    !issue.trim()
  ) {
    return res.status(400).json({
      message: "Customer and issue are required"
    });
  }

  const statement = db.prepare(
    "INSERT INTO tickets (customer, issue, status) VALUES (?, ?, ?)"
  );

  const result = statement.run(
    customer.trim(),
    issue.trim(),
    "Open"
  );

  const newTicket = db.prepare(
    "SELECT * FROM tickets WHERE id = ?"
  ).get(Number(result.lastInsertRowid));

  res.status(201).json(newTicket);
});



app.put("/api/tickets/:id", function(req, res) {
  const ticketId = Number(req.params.id);
  const newStatus = req.body?.status;

  if (!Number.isSafeInteger(ticketId) || ticketId < 1) {
    return res.status(400).json({
      message: "Invalid ticket ID"
    });
  }

  if (!["Open", "Pending", "Resolved"].includes(newStatus)) {
    return res.status(400).json({
      message: "Invalid ticket status"
    });
  }

  const result = db.prepare(
    "UPDATE tickets SET status = ? WHERE id = ?"
  ).run(newStatus, ticketId);

  if (result.changes === 0) {
    return res.status(404).json({
      message: "Ticket not found"
    });
  }

  const updatedTicket = db.prepare(
    "SELECT * FROM tickets WHERE id = ?"
  ).get(ticketId);

  res.json(updatedTicket);
});




app.delete("/api/tickets/:id", function(req, res) {
  const ticketId = Number(req.params.id);

  if (!Number.isSafeInteger(ticketId) || ticketId < 1) {
    return res.status(400).json({
      message: "Invalid ticket ID"
    });
  }

  const ticket = db.prepare(
    "SELECT * FROM tickets WHERE id = ?"
  ).get(ticketId);

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket not found"
    });
  }

  db.prepare(
    "DELETE FROM tickets WHERE id = ?"
  ).run(ticketId);

  res.json({
    message: "Ticket deleted successfully",
    ticket: ticket
  });
});





app.get("/api/tickets", function(req, res) {
  const tickets = db.prepare("SELECT * FROM tickets").all();

  res.json(tickets);
});






























app.listen(3000, function() {
  console.log("Server running on http://localhost:3000");
});
