# Personal Developer Portfolio

This project is separated into a frontend (`client`) and a backend (`server`).

## Folder Structure
- `client/`: React + TypeScript frontend (Vite)
- `server/`: Node.js + Express backend

## 🚀 How to Start the Frontend

1. Open a terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## 🚀 How to Start the Backend

1. Open a **new** terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (uses nodemon to auto-reload):
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000` (or whichever port is defined in `.env`).

## Features Configured So Far
- Full-bleed animated hero video with typography & counters matching the requested theme.
- Responsive sections for About, Skills, Activity, Projects, and Contact.
- Ready-to-connect Express API for the contact form.
