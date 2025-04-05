## Drug Detection System 🔬

<img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.103.0+-blue?style=flat&amp;logo=fastapi">
<img alt="React" src="https://img.shields.io/badge/React-19.0.0-blue?style=flat&amp;logo=react">
<img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-15+-blue?style=flat&amp;logo=postgresql&amp;logoColor=white">
<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3.3.0+-blue?style=flat&amp;logo=tailwindcss">

## 📋 Overview

This project implements a login system for a drug detection application. It uses a FastAPI backend with PostgreSQL database for authentication, and a React frontend with Tailwind CSS for the user interface.

## ✨ Features

* 🔒 Secure user authentication
* 🔑 Password hashing with bcrypt
* 🗄️ PostgreSQL database integration
* 🎨 Modern React UI with Tailwind CSS
* 🚀 API built with FastAPI

## 📁 Directory Structure
```
├── login_backend/        # FastAPI backend
│   ├── main.py           # API endpoints and database models
│   └── .env              # Environment variables (not tracked in git)
└── src/                  # React frontend
    ├── components/       # React components
    │   └── Content.jsx   # Login form component
    ├── App.jsx           # Main application component
    └── main.jsx          # Entry point
```

## 🚀 Getting Started
Prerequisites
* Python 3.8+
* Node.js 16+
* PostgreSQL

# Backend Setup
1. Navigate to the backend directory:
```
cd login_backend
```
2. Install Python dependencies:
```
pip install -r requirements.txt
```
3. Create a PostgreSQL database named `login`

4. Create a `.env` file with your database connection string:
```
DATABASE_URL=postgresql://postgres@localhost/login
```
5. Start the backend server:
```
uvicorn main:app --reload
```
The API will be available at http://localhost:8000

Frontend Setup
1. Install Node.js dependencies:
```
npm install
```
2. Start the development server:
```
npm run dev
```
dev
The application will be available at http://localhost:5173

## 🔌 API Endpoints
| Endpoint  | Method | Description |
| -- | -- | -- |
| `/` | GET | API health check |
| `/login` | POST | User authentication |

## 🔑 Test Credentials
* Username: testuser
* Password: test123

## 💻 Technologies Used
* Backend:
  * FastAPI
  * SQLAlchemy
  * PostgreSQL
  * Python
* Frontend:
  * React
  * Tailwind CSS
  * Vite
  * Authentication:
  * Passlib with bcrypt
