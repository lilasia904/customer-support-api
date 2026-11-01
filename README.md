
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
| GET | /api/tickets/:id | Retrieve one ticket |
| POST | /api/tickets | Create a ticket |
| PUT | /api/tickets/:id | Update ticket status |
| DELETE | /api/tickets/:id | Delete a ticket |

## Installation

1. Clone this repository.
2. Open the project folder.
3. Install dependencies:

    npm install

4. Start the server:

    node server.js

5. Open the application in your browser:

    http://localhost:3000/tracker/

The SQLite database is created automatically when the application starts.

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

This project is currently intended for local development and demonstration.

Authentication, authorization, additional security protections, and production deployment are future improvements.



## Deployment Status

This full-stack application has been developed and
tested locally using Node.js, Express, and SQLite.

Deployment is pending hosting setup.

Features include:
- Administrator authentication
- Persistent SQLite ticket storage
- Create, read, update, and delete tickets
- CSRF protection and API rate limiting
- Input validation and error handling
- Persistent administrator sessions
- Server health-check endpoint
