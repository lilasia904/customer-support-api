
require("dotenv").config();

const express = require("express");

const { randomBytes, timingSafeEqual } = require("node:crypto");


const path = require("node:path");


const { rateLimit } = require("express-rate-limit");


const helmet = require("helmet");

const session = require("express-session");

const pool = require("./postgres");

const PgSession = require("connect-pg-simple")(session);

const sessionStore = new PgSession({
  pool: pool,
  createTableIfMissing: true,
  pruneSessionInterval: 900
});

const bcrypt = require("bcryptjs");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}



const isDevelopment = app.get("env") === "development";

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "upgrade-insecure-requests": isDevelopment ? null : []
    }
  },
  strictTransportSecurity: isDevelopment ? false : undefined
}));

app.use(express.json({
  limit: "10kb"
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later."
  }
});

app.use("/api/tickets", apiLimiter);

function checkRequestOrigin(req, res, next) {
  const protectedMethods = [
    "POST",
    "PUT",
    "PATCH",
    "DELETE"
  ];

  if (!protectedMethods.includes(req.method)) {
    return next();
  }

  const requestOrigin = req.get("Origin");
  const allowedOrigin = process.env.APP_ORIGIN;

  if (!allowedOrigin || requestOrigin !== allowedOrigin) {
    return res.status(403).json({
      message: "Request blocked: untrusted origin."
    });
  }

  next();
}

app.use("/api", checkRequestOrigin);



const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later."
  }
});



if (
  !process.env.SESSION_SECRET ||
  !process.env.ADMIN_USERNAME ||
  !process.env.ADMIN_PASSWORD_HASH
) {
  throw new Error("Missing authentication settings in .env");
}


app.use(session({
  store: sessionStore,
  name: "ticket.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000
  }
}));



app.get("/api/csrf-token", (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString("hex");
  }

  res.set("Cache-Control", "no-store");

  res.json({
    csrfToken: req.session.csrfToken
  });
});


function verifyCsrfToken(req, res, next) {
  const protectedMethods = [
    "POST",
    "PUT",
    "PATCH",
    "DELETE"
  ];

  if (!protectedMethods.includes(req.method)) {
    return next();
  }

  const receivedToken = req.get("X-CSRF-Token");
  const expectedToken = req.session?.csrfToken;

  const validFormat =
    typeof receivedToken === "string" &&
    typeof expectedToken === "string" &&
    /^[0-9a-f]{64}$/.test(receivedToken) &&
    /^[0-9a-f]{64}$/.test(expectedToken);

  if (
    !validFormat ||
    !timingSafeEqual(
      Buffer.from(receivedToken, "hex"),
      Buffer.from(expectedToken, "hex")
    )
  ) {
    return res.status(403).json({
      message: "Invalid or missing CSRF token."
    });
  }

  next();
}

app.use("/api", verifyCsrfToken);


app.post("/api/login", loginLimiter, async (req, res, next) => {
  const { username, password } = req.body || {};

  if (
  typeof username !== "string" ||
  typeof password !== "string" ||
  username.length === 0 ||
  password.length === 0 ||
  username.length > 100 ||
  Buffer.byteLength(password, "utf8") > 72
) {
  return res.status(400).json({
    message: "Invalid username or password format."
  });
}

  try {
    const passwordMatches = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (
      username !== process.env.ADMIN_USERNAME ||
      !passwordMatches
    ) {
      return res.status(401).json({
        message: "Invalid username or password."
      });
    }

    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.isAdmin = true;

      req.session.csrfToken = randomBytes(32).toString("hex");

      req.session.save((error) => {
        if (error) return next(error);

        res.json({
          message: "Login successful."
        });
      });
    });
  } catch (error) {
    next(error);
  }
});


app.post("/api/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie("ticket.sid", {
      path: "/"
    });

    res.json({
      message: "Logged out successfully."
    });
  });
});



function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin === true) {
    return next();
  }

  return res.status(401).json({
    message: "Please sign in to access tickets."
  });
}

app.use("/api/tickets", requireAdmin);

app.get(
  ["/tracker", "/tracker/", "/tracker/index.html"],
  (req, res) => {

    if (!req.session || req.session.isAdmin !== true) {
      return res.redirect("/tracker/login.html");
    }

    res.sendFile(
      path.join(__dirname, "public", "index.html")
    );
  }
);


app.use("/tracker", express.static("public"));



app.get("/", function(req, res) {
  res.send("Welcome to my Customer Support API!");
});


// CREATE A NEW TICKET IN POSTGRESQL

app.post("/api/tickets", async function(req, res, next) {
  const customer = req.body?.customer;
  const issue = req.body?.issue;

  // Validate required fields
  if (
    typeof customer !== "string" ||
    !customer.trim() ||
    typeof issue !== "string" ||
    !issue.trim()
  ) {
    return res.status(400).json({
      message: "Customer and issue are required."
    });
  }

  // Validate character limits
  if (
    customer.trim().length > 80 ||
    issue.trim().length > 500
  ) {
    return res.status(400).json({
      message:
        "Customer name must be 80 characters or fewer, and issue must be 500 characters or fewer."
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tickets (customer, issue, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        customer.trim(),
        issue.trim(),
        "Open"
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    next(error);
  }
});


// UPDATE TICKET STATUS IN POSTGRESQL

app.put("/api/tickets/:id", async function(req, res, next) {
  const ticketId = Number(req.params.id);
  const newStatus = req.body?.status;

  // Validate ticket ID
  if (
    !Number.isSafeInteger(ticketId) ||
    ticketId < 1
  ) {
    return res.status(400).json({
      message: "Invalid ticket ID."
    });
  }

  // Validate ticket status
  if (
    !["Open", "Pending", "Resolved"].includes(newStatus)
  ) {
    return res.status(400).json({
      message: "Invalid ticket status."
    });
  }

  try {
    const result = await pool.query(
      `UPDATE tickets
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [newStatus, ticketId]
    );

    // Check whether the ticket exists
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Ticket not found."
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    next(error);
  }
});

// DELETE A TICKET FROM POSTGRESQL

app.delete("/api/tickets/:id", async function(req, res, next) {
  const ticketId = Number(req.params.id);

  // Validate ticket ID
  if (
    !Number.isSafeInteger(ticketId) ||
    ticketId < 1
  ) {
    return res.status(400).json({
      message: "Invalid ticket ID."
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM tickets
       WHERE id = $1
       RETURNING *`,
      [ticketId]
    );

    // Check whether the ticket existed
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Ticket not found."
      });
    }

    res.json({
      message: "Ticket deleted successfully",
      ticket: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
});

// GET ALL TICKETS FROM POSTGRESQL

app.get("/api/tickets", async function(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT * FROM tickets ORDER BY id ASC"
    );

    res.json(result.rows);

  } catch (error) {
    next(error);
  }
});



app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok"
  });
});

app.use((err, req, res, next) => {

  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON. Check the request format."
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request is too large."
    });
  }

  console.error("Server Error:", err);

  res.status(500).json({
    message: "Something went wrong on the server."
  });

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

