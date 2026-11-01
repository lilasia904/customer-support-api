const ticketForm = document.getElementById("ticketForm");
const ticketTitle = document.getElementById("ticketTitle");
const ticketList = document.querySelector(".ticket-list");
const statusFilter = document.getElementById("statusFilter");
const ticketSearch = document.getElementById("ticketSearch");




function createTicketCard(issue, status = "Open", storageIndex = null, ticketId = null, customer = "") {

    const displayStatus = status === "Pending" ? "In Progress" : status;

    const newTicket = document.createElement("article");
    newTicket.classList.add("ticket-card");

    const newTitle = document.createElement("h3");
    newTitle.textContent = issue;

    const customerText = document.createElement("p");
    customerText.textContent = "Customer: " + customer;
    customerText.classList.add("ticket-customer");

    const newStatus = document.createElement("p");
    newStatus.textContent = "Status: " + displayStatus;
    newStatus.classList.add("status-text");
    
    newTicket.appendChild(newTitle);

    if (customer) {
      newTicket.appendChild(customerText);
    }

    newTicket.appendChild(newStatus);

    const newDropdown = document.createElement("select");
newDropdown.classList.add("ticket-status");
newDropdown.setAttribute(
    "aria-label",
    "Update status for " + issue
);

const openOption = document.createElement("option");

openOption.value = "Open";
openOption.textContent = "Open";

newDropdown.appendChild(openOption);

const progressOption = document.createElement("option");

progressOption.value = "In Progress";
progressOption.textContent = "In Progress";

newDropdown.appendChild(progressOption);

const resolvedOption = document.createElement("option");

resolvedOption.value = "Resolved";
resolvedOption.textContent = "Resolved";

newDropdown.appendChild(resolvedOption);

newDropdown.value = displayStatus;

newTicket.appendChild(newDropdown);

const deleteButton = document.createElement("button");
deleteButton.type = "button";
deleteButton.classList.add("delete-ticket");
deleteButton.textContent = "Delete Ticket";

newTicket.appendChild(deleteButton);



    ticketList.appendChild(newTicket);


    updateTicketStats();

    filterTickets();


    if (storageIndex !== null) {
        newTicket.dataset.storageIndex = storageIndex;
    }

    
if (ticketId !== null) {
  newTicket.dataset.ticketId = ticketId;

}



}


ticketForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const customer = document.getElementById("customerName").value.trim();
  const issue = ticketTitle.value.trim();

  if (customer === "" || issue === "") {
    return;
  }

  try {

    const csrfToken = await getCsrfToken();

    const response = await fetch("/api/tickets", {
      method: "POST",
      
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },

      body: JSON.stringify({
        customer: customer,
        issue: issue
      })
    });

    
const newTicket = await response.json();

if (!response.ok) {
  throw new Error(
    newTicket.message || "Unable to save ticket."
  );
}
    createTicketCard(
      newTicket.issue,
      newTicket.status,
      null,
      newTicket.id,
      newTicket.customer
    );

    document.getElementById("customerName").value = "";
    ticketTitle.value = "";
    ticketTitle.focus();

  
} catch (error) {
  console.error("Create Ticket Error:", error);

  alert(error.message || "Unable to save ticket.");
}

});




    
ticketList.addEventListener("change", async function(event) {
  if (!event.target.matches(".ticket-status")) {
    return;
  }

  const ticket = event.target.closest(".ticket-card");
  const ticketId = ticket?.dataset.ticketId;

  if (!ticketId) {
    return;
  }

  const dropdown = event.target;
  const statusText = ticket.querySelector(".status-text");

  const oldStatus = statusText.textContent.replace("Status: ", "");
  const selectedStatus = dropdown.value;

  const apiStatus =
    selectedStatus === "In Progress" ? "Pending" : selectedStatus;

  dropdown.disabled = true;

  try {

    const csrfToken = await getCsrfToken();

    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify({
        status: apiStatus
      })
    });

    if (!response.ok) {
      throw new Error("Could not update ticket");
    }

    statusText.textContent = "Status: " + selectedStatus;

    updateTicketStats();
    filterTickets();

  } catch (error) {
    console.error("Update Ticket Error:", error);

    dropdown.value = oldStatus;
    alert("Unable to update ticket status.");

  } finally {
    dropdown.disabled = false;
  }
});


/*
const storedTickets = JSON.parse(
  localStorage.getItem("supportTickets") || "[]"
);

storedTickets.forEach(function(ticket, index) {
  createTicketCard(ticket.issue, ticket.status, index);
});
*/


ticketList.addEventListener("click", async function(event) {
  const deleteButton = event.target.closest(".delete-ticket");

  if (!deleteButton) {
    return;
  }

  const ticket = deleteButton.closest(".ticket-card");
  const ticketId = ticket?.dataset.ticketId;

  if (!ticketId) {
    return;
  }

  deleteButton.disabled = true;

  try {

    const csrfToken = await getCsrfToken();

    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: "DELETE",
      headers: {
        "X-CSRF-Token": csrfToken
      },
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error("Could not delete ticket");
    }

    ticket.remove();

    updateTicketStats();
    filterTickets();

  } catch (error) {
    console.error("Delete Ticket Error:", error);

    alert("Unable to delete ticket. Please try again.");
    deleteButton.disabled = false;
  }
});



function updateTicketStats() {
  const total = ticketList.querySelectorAll(
    ".ticket-card"
  ).length;

  document.getElementById("totalTickets").textContent = total;

  const openTickets = Array.from(
    ticketList.querySelectorAll(".ticket-status")
  ).filter(function(select) {
    return select.value === "Open";
  }).length;

  document.getElementById("openTickets").textContent = openTickets;



const inProgressTickets = Array.from(
  ticketList.querySelectorAll(".ticket-status")
).filter(function(select) {
  return select.value === "In Progress";
}).length;

document.getElementById("inProgressTickets").textContent = inProgressTickets;



const resolvedTickets = Array.from(
  ticketList.querySelectorAll(".ticket-status")
).filter(function(select) {
  return select.value === "Resolved";
}).length;

document.getElementById("resolvedTickets").textContent = resolvedTickets;


}



function filterTickets() {
  const selectedStatus = statusFilter.value;

  const searchText = ticketSearch.value.toLowerCase().trim();

  const tickets = ticketList.querySelectorAll(".ticket-card");

  let visibleCount = 0;


  tickets.forEach(function(ticket) {
    const ticketStatus = ticket.querySelector(".ticket-status").value;

    const ticketTitle = ticket.querySelector("h3").textContent.toLowerCase();

    const matchesStatus =
      selectedStatus === "All" || ticketStatus === selectedStatus;

    const matchesSearch = ticketTitle.includes(searchText);

    
if (matchesStatus && matchesSearch) {
  ticket.style.display = "";
  visibleCount++;
} else {
  ticket.style.display = "none";
}

  });


const noResults = document.getElementById("noResults");

if (tickets.length === 0) {
  noResults.textContent = "No tickets yet. Create your first support ticket.";
} else {
  noResults.textContent = "No matching tickets found.";
}

noResults.hidden = visibleCount > 0;


}



statusFilter.addEventListener("change", function() {
  filterTickets();

});

ticketSearch.addEventListener("input", function() {
  filterTickets();
});


updateTicketStats();


async function testDatabaseConnection() {
  try {
    const response = await fetch("/api/tickets");

    if (!response.ok) {
      throw new Error("Could not load tickets");
    }

    const databaseTickets = await response.json();

    console.log("Tickets from SQLite:", databaseTickets);


databaseTickets.forEach(function(ticket) {
  
createTicketCard(
  ticket.issue,
  ticket.status,
  null,
  ticket.id,
  ticket.customer
);

});

  } catch (error) {
    console.error("API connection error:", error);
  }
}

testDatabaseConnection();



const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", async function() {
  logoutButton.disabled = true;

  try {
    
    const csrfToken = await getCsrfToken();

    const response = await fetch("/api/logout", {
      method: "POST",
      headers: {
        "X-CSRF-Token": csrfToken
      },
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error("Logout failed.");
    }

    window.location.href = "/tracker/login.html";

  } catch (error) {
    alert("Unable to log out. Please try again.");
    logoutButton.disabled = false;
  }
});



async function getCsrfToken() {
  const response = await fetch("/api/csrf-token", {
    credentials: "same-origin",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to get CSRF token.");
  }

  const data = await response.json();

  return data.csrfToken;
}
