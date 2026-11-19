
# Customer Support Ticket Tracker — Full-Stack Application

A full-stack customer support ticket management application built using HTML, CSS, JavaScript, Node.js, Express, and SQLite.

Users can create, view, update, and delete customer support tickets through a responsive web interface.

## Features

- Create customer support tickets
- Store customer names and issues
- View tickets retrieved from SQLite
- Update ticket statuses
- Delete tickets
- Search and filter tickets
- Track ticket statistics
- Responsive user interface
- REST API with CRUD operations
- Persistent SQLite database storage
- Error handling and input validation

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- REST API

### Database
- SQLite
- SQL queries

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tickets | Retrieve all tickets |
| POST | /api/tickets | Create a ticket |
| PUT | /api/tickets/:id | Update ticket status |
| DELETE | /api/tickets/:id | Delete a ticket |

## Installation

### Prerequisites

Before running this project, make sure you have:

- Node.js 24 or newer (up to version 26)
- npm
- Git

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

Navigate into the project directory:

```bash
cd customer-support-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root using
`.env.example` as a template.

For local development, configure:

- `NODE_ENV=development`
- `PORT=3000`
- `APP_ORIGIN=http://localhost:3000`
- `DATA_DIR=.`
- `ADMIN_USERNAME` — Your administrator username
- `SESSION_SECRET` — A strong, randomly generated secret
- `ADMIN_PASSWORD_HASH` — A bcrypt hash of your administrator password

Never commit your actual `.env` file or credentials to GitHub.

### 4. Start the Server

```bash
npm start
```

The application automatically initializes its SQLite
database tables when the server starts.

### 5. Open the Application

Visit:

http://localhost:3000/tracker/login.html

Sign in using the administrator credentials configured
in your environment variables.

### Database Storage

The application uses SQLite to store customer support
tickets and administrator sessions.

Database files are excluded from Git.

Local data persists between application restarts.
Production hosting requires persistent database storage.

## What I Learned

- Creating a backend server with Node.js
- Building REST APIs using Express
- Using HTTP methods: GET, POST, PUT, DELETE
- Writing SQL queries
- Connecting a frontend to a backend using fetch()
- Validating incoming requests
- Handling API errors
- Saving and retrieving data from a database
- Building a full-stack CRUD application

## Project Status

This application is functional and has been tested locally.

Implemented features include:

- Administrator authentication
- Session-based authorization
- CSRF protection
- API rate limiting
- Secure password verification using bcrypt
- Server-side input validation
- SQLite database storage
- Full CRUD functionality
- Search and status filtering
- Ticket statistics

Production deployment is planned for a future update.


## Live Application

The Customer Support Ticket Tracker is deployed on Render
and uses Neon PostgreSQL for persistent database storage.

Live Application:
https://customer-support-api-1ij1.onrender.com/tracker/

### Deployment

- Hosting: Render
- Database: Neon PostgreSQL
- Backend: Node.js and Express
- Authentication: Administrator login with persistent sessions
- Security: CSRF protection, rate limiting, and input validation

Note: The application currently requires administrator credentials.
A public demonstration account is planned for a future update.