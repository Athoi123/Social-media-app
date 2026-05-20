# Social Media Web App

A modern full-stack social media application built with React, Vite, Node.js, Express, and MongoDB. This project features a polished glassmorphism UI, secure user authentication, dynamic splash loading, full CRUD post/comment interactions, user profile management, and Base64 image uploads.

## Tech Stack

- React 19 + Vite
- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcrypt for password hashing
- CORS for secure frontend/backend requests
- Base64 image upload support

## Features

- Modern glassmorphism UI design with responsive layout
- User authentication with registration and login
- Dynamic custom splash loading screen
- Full CRUD operations for posts
- Comment creation and display on posts
- Like/unlike posts functionality
- User profile management with editable bio/caption
- Profile image upload using Base64 encoding
- Secure backend routes with JWT verification

## Prerequisites

- Node.js (>= 18)
- npm
- MongoDB instance or MongoDB Atlas

## Environment Variables

Create a `.env` file inside the `backend` folder with the following values:

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
PORT=5000
```

## Installation

### Backend Setup

1. Open a terminal and navigate to the backend folder:

```bash
cd backend
```

2. Install backend dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
npm start
```

### Frontend Setup

1. Open a second terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Running the App

- Backend runs on `http://localhost:5000` by default
- Frontend runs on the Vite dev server, usually `http://localhost:5173`

Use separate terminals for the backend and frontend to keep both servers running simultaneously.

## Notes

- The backend supports image uploads as Base64 strings, enabling quick previews and storage in user and post records.
- All authenticated actions are protected by JWT tokens and require the `Authorization: Bearer <token>` header.
- The user profile route allows bio updates and profile image changes.

## Directory Structure

- `backend/` — Express server, MongoDB models, API routes
- `frontend/` — React/Vite client application

---

Built as a complete full-stack social media experience with a modern UI and secure authentication flows.
