// CUSTOMER SUPPORT TRACKER — PUBLIC DEMO
// Demo data stays in the visitor's browser.
// This file does not access the administrator API.

const DEMO_STORAGE_KEY = "customer-support-demo-v1";

const ticketForm = document.getElementById("ticketForm");
const ticketTitle = document.getElementById("ticketTitle");
const customerName = document.getElementById("customerName");
const addTicketButton = document.getElementById("addTicketButton");

const ticketList = document.querySelector(".ticket-list");
const statusFilter = document.getElementById("statusFilter");
const ticketSearch = document.getElementById("ticketSearch");
const noResults = document.getElementById("noResults");
const resetDemoButton = document.getElementById("resetDemoButton");

// ORIGINAL SAMPLE TICKETS

function getSampleTickets() {
  return [
    {
      id: 1,
      customer: "Jessica Williams",
      issue: "Unable to access customer account",
      status: "Open"
    },
    {
      id: 2,
      customer: "Michael Johnson",
      issue: "Order confirmation email not received",
      status: "Pending"
    },
    {
      id: 3,
      customer: "Ashley Brown",
      issue: "Payment processing error",
      status: "Resolved"
    },
    {
      id: 4,
      customer: "Daniel Carter",
      issue: "Request to update billing information",
      status: "Open"
    }
  ];
}

// LOAD DEMO DATA

function loadTickets() {
  try {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY);

    if (saved === null) {
      return getSampleTickets();
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : getSampleTickets();

  } catch (error) {
    console.error("Unable to load demo tickets:", error);
    return getSampleTickets();
  }
}

let tickets = loadTickets();

// SAVE DEMO DATA

function saveTickets() {
  localStorage.setItem(
    DEMO_STORAGE_KEY,
    JSON.stringify(tickets)
  );
}

// DISPLAY TICKETS

function renderTickets() {
  // Remove only ticket cards, not filters or headings.
  ticketList.querySelectorAll(".ticket-card").forEach(
    card => card.remove()
  );

  const selectedStatus = statusFilter.value;
  const searchText = ticketSearch.value.toLowerCase().trim();

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus =
      selectedStatus === "All" ||
      ticket.status === selectedStatus;

    const matchesSearch =
      ticket.issue.toLowerCase().includes(searchText) ||
      ticket.customer.toLowerCase().includes(searchText);

    return matchesStatus && matchesSearch;
  });

  filteredTickets.forEach(ticket => {
    const card = document.createElement("article");
    card.className = "ticket-card";

    const title = document.createElement("h3");
    title.textContent = ticket.issue;

    const customer = document.createElement("p");
    customer.className = "ticket-customer";
    customer.textContent = "Customer: " + ticket.customer;

    const statusText = document.createElement("p");
    statusText.className = "status-text";
    statusText.textContent =
      "Status: " +
      (ticket.status === "Pending"
        ? "In Progress"
        : ticket.status);

    const statusDropdown = document.createElement("select");
    statusDropdown.className = "ticket-status";
    statusDropdown.setAttribute(
      "aria-label",
      "Update status for " + ticket.issue
    );

    const statuses = [
      ["Open", "Open"],
      ["Pending", "In Progress"],
      ["Resolved", "Resolved"]
    ];

    statuses.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      statusDropdown.appendChild(option);
    });

    statusDropdown.value = ticket.status;

    statusDropdown.addEventListener("change", () => {
      ticket.status = statusDropdown.value;
      saveTickets();
      renderTickets();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-ticket";
    deleteButton.textContent = "Delete Ticket";

    deleteButton.addEventListener("click", () => {
      tickets = tickets.filter(item => item.id !== ticket.id);
      saveTickets();
      renderTickets();
    });

    card.append(
      title,
      customer,
      statusText,
      statusDropdown,
      deleteButton
    );

    ticketList.appendChild(card);
  });

  // EMPTY STATE

  if (tickets.length === 0) {
    noResults.textContent =
      "No tickets yet. Create your first support ticket.";
  } else {
    noResults.textContent = "No matching tickets found.";
  }

  noResults.hidden = filteredTickets.length > 0;

  updateTicketStats();
}

// DASHBOARD STATISTICS

function updateTicketStats() {
  document.getElementById("totalTickets").textContent =
    tickets.length;

  document.getElementById("openTickets").textContent =
    tickets.filter(ticket => ticket.status === "Open").length;

  document.getElementById("inProgressTickets").textContent =
    tickets.filter(ticket => ticket.status === "Pending").length;

  document.getElementById("resolvedTickets").textContent =
    tickets.filter(ticket => ticket.status === "Resolved").length;
}

// CREATE TICKET

ticketForm.addEventListener("submit", event => {
  event.preventDefault();

  if (addTicketButton.disabled) return;

  const customer = customerName.value.trim();
  const issue = ticketTitle.value.trim();

  if (!customer || !issue) return;

  if (customer.length > 80 || issue.length > 500) {
    alert("Customer names must be 80 characters or fewer, and issues must be 500 characters or fewer.");
    return;
  }

  addTicketButton.disabled = true;

  try {
    const nextId = tickets.length
      ? Math.max(...tickets.map(ticket => ticket.id)) + 1
      : 1;

    tickets.push({
      id: nextId,
      customer,
      issue,
      status: "Open"
    });

    saveTickets();

    customerName.value = "";
    ticketTitle.value = "";

    renderTickets();
    customerName.focus();

  } catch (error) {
    console.error("Unable to create demo ticket:", error);
    alert("Unable to save demo ticket in this browser.");

  } finally {
    addTicketButton.disabled = false;
  }
});

// SEARCH AND FILTER

statusFilter.addEventListener("change", renderTickets);
ticketSearch.addEventListener("input", renderTickets);

// RESET DEMO

resetDemoButton.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Reset all demo tickets to their original sample data?"
  );

  if (!confirmed) return;

  tickets = getSampleTickets();

  statusFilter.value = "All";
  ticketSearch.value = "";

  saveTickets();
  renderTickets();
});

// INITIAL DISPLAY

renderTickets();