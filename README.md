# 🎓 WMOU SCHOOL PORTAL

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF.svg?style=flat&logo=Vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E.svg?style=flat&logo=Supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A comprehensive web-based platform for managing academic activities, course registration, payments, and student records. Built with modern technologies to ensure scalability, security, and optimal performance.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Usage](#usage)
- [Project Structure](#project-structure)

## 🎯 Overview

The School Portal System is an enterprise-grade web application designed to streamline academic operations for educational institutions. It provides a centralized platform for students and administrators to manage courses, payments, materials, and academic records efficiently.

### Key Highlights

- **Role-Based Access Control**: Secure authentication for Students and Administrators
- **Real-Time Updates**: Instant notifications and live data synchronization
- **Payment Integration**: Secure payment processing with Paystack
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Scalable Architecture**: Built to handle growing institutional needs

## ✨ Features

### For Students

- 🔐 **Secure Authentication** - Login with encrypted credentials
- 📚 **Course Registration** - Browse and register for available courses
- 💳 **Payment Processing** - Pay fees securely with multiple payment options
- 📥 **Material Access** - Download course materials, handouts, and slides
- 📊 **Result Checking** - View grades, GPA, and CGPA
- 👤 **Profile Management** - Update personal information and preferences
- 🔔 **Notifications** - Receive alerts for important updates
- 📜 **Transaction History** - Track all payment records

### For Administrators

- 👥 **Student Management** - View, edit, and manage student accounts
- 📖 **Course Management** - Create, update, and organize courses
- 📤 **Material Upload** - Distribute learning materials to students
- 📈 **Analytics Dashboard** - Monitor enrollment, revenue, and activity
- 💰 **Payment Tracking** - Oversee all financial transactions
- 📢 **Announcements** - Broadcast important messages
- 📑 **Report Generation** - Export registration and payment reports
- 🎓 **Result Management** - Upload and modify student grades

## 🛠 Tech Stack

### Frontend

- **React 18.2** - UI library for building interactive interfaces
- **Vite 5.0** - Next-generation frontend tooling
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form validation
- **React Hot Toast** - Elegant notifications

### Backend

- **FastAPI** - Modern Python web framework
- **Uvicorn** - Lightning-fast ASGI server
- **Pydantic** - Data validation using Python type annotations
- **Python-JOSE** - JWT token implementation
- **Passlib** - Password hashing library
- **Python-Multipart** - File upload handling

### Database & Services

- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Authentication service
- **Supabase Storage** - File storage solution
- **Paystack** - Payment gateway integration

## 🏗 System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │◄───────►│  FastAPI Server │◄───────►│    Supabase     │
│   (Port 5173)   │         │   (Port 8000)   │         │   PostgreSQL    │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                           │
        │                           │                           │
        ▼                           ▼                           ▼
  User Interface            API Endpoints              Database & Auth
  - Components              - Authentication            - User Tables
  - State Management        - CRUD Operations           - Course Data
  - Routing                 - File Handling             - Transactions
                            - Business Logic            - Real-time Sync
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **Python** >= 3.9
- **npm** or **yarn**
- **pip** (Python package installer)
- **Git**
- **Supabase Account** (free tier available)
- **Paystack Account** (for payment integration)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/school-portal-system.git
cd school-portal-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd school-portal-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi "uvicorn[standard]" supabase python-dotenv pydantic pydantic-settings python-multipart "passlib[bcrypt]" "python-jose[cryptography]" paystack

# Create requirements.txt
pip freeze > requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../school-portal-frontend

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom @supabase/supabase-js axios react-hook-form lucide-react zustand react-hot-toast

# Install TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `school-portal-backend` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# JWT Configuration
SECRET_KEY=your-secret-key-generate-with-openssl
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key

# Environment
ENVIRONMENT=development
```

**Generate a secure SECRET_KEY:**
```bash
openssl rand -hex 32
```

### Frontend Configuration

Create a `.env` file in the `school-portal-frontend` directory:

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### TailwindCSS Configuration

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🗄 Database Schema

### Tables Structure

#### `students`
```sql
- id (uuid, primary key)
- email (text, unique)
- password_hash (text)
- first_name (text)
- last_name (text)
- matric_number (text, unique)
- phone (text)
- address (text)
- profile_picture_url (text)
- status (enum: active, suspended, graduated)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `courses`
```sql
- id (uuid, primary key)
- course_code (text, unique)
- course_name (text)
- description (text)
- credit_hours (integer)
- fee (decimal)
- semester (text)
- session (text)
- faculty (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `enrollments`
```sql
- id (uuid, primary key)
- student_id (uuid, foreign key)
- course_id (uuid, foreign key)
- enrollment_date (timestamp)
- status (enum: active, dropped, completed)
- grade (text, nullable)
```

#### `payments`
```sql
- id (uuid, primary key)
- student_id (uuid, foreign key)
- amount (decimal)
- payment_type (text)
- reference (text, unique)
- status (enum: pending, successful, failed)
- payment_date (timestamp)
```

#### `materials`
```sql
- id (uuid, primary key)
- course_id (uuid, foreign key)
- title (text)
- description (text)
- file_url (text)
- file_type (text)
- uploaded_at (timestamp)
```

## 📚 API Documentation

Once the backend is running, access interactive API documentation at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

#### Students
- `GET /api/students/me` - Get current student profile
- `PUT /api/students/me` - Update profile
- `GET /api/students/courses` - Get enrolled courses
- `GET /api/students/results` - Get academic results

#### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/{id}` - Get course details
- `POST /api/courses/enroll` - Enroll in course
- `DELETE /api/courses/drop/{id}` - Drop course

#### Payments
- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/verify/{reference}` - Verify payment
- `GET /api/payments/history` - Get payment history

#### Admin (Protected)
- `GET /api/admin/students` - List all students
- `POST /api/admin/courses` - Create course
- `POST /api/admin/materials` - Upload material
- `POST /api/admin/results` - Upload results

## 💻 Usage

### Development Mode

#### Start Backend Server

```bash
cd school-portal-backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend Development Server

```bash
cd school-portal-frontend
npm run dev
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Production Build

#### Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
npm run build
npm run preview
```
