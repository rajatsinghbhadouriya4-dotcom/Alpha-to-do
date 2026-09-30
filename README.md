# 🚑 EmergencyCare — Decision Intelligence & Full-Stack Admin Control System

> *"Smarter Decisions When Every Minute Matters."*

EmergencyCare is an emergency medical response platform designed to transform fragmented emergency data into explainable, actionable insights. Integrated with a Node.js + Express MVC backend, Supabase PostgreSQL database, stateless JWT authentication, bcrypt password hashing, and role-based administrator controls.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Folder Structure](#-folder-structure)
6. [Database & Supabase Setup](#-database--supabase-setup)
7. [Environment Variables](#-environment-variables)
8. [API Endpoints](#-api-endpoints)
9. [Authentication & Security](#-authentication--security)
10. [Test Credentials](#-test-credentials)
11. [How to Run Locally](#-how-to-run-locally)
12. [How to Build & Deploy](#-how-to-build--deploy)
13. [Troubleshooting & Common Errors](#-troubleshooting--common-errors)

---

## 🌟 Project Overview

During severe medical emergencies (cardiac arrests, poly-trauma accidents, strokes), families face panic and incomplete information: *Which hospital actually has an ICU bed right now? Is a trauma surgeon on duty? Can our Ayushman Bharat or private health insurance card be accepted cashlessly? What is the real-time ambulance ETA through city traffic?*

EmergencyCare addresses this with **Decision Intelligence**:
- Aggregates live bed capacities (ICU, Ventilator, Oxygen, Trauma).
- Cross-references verified insurance schemes (Ayushman Bharat PM-JAY, CGHS, private health cards).
- Dynamically analyzes multi-route traffic (Direct Green Corridor vs. Bypass vs. Shortest Path).
- Emits verified emergency summary receipts and pre-appointment letters with transparent hospital tariff breakdowns.
- Equips hospital administrators with real-time user management and bed capacity synchronization tools.

---

## ⚡ Key Features

### 1. Decision Intelligence Engine
- Algorithmic triage score combining travel time, confirmed bed availability, specialist doctor availability, and cashless insurance coverage.
- Explainable recommendation chips explaining the exact reasoning behind hospital prioritization.

### 2. Live Interactive Leaflet Map & Telemetry
- Real-time GPS simulation with animated ambulance movement.
- Telemetry telemetry HUD: dynamic distance in km, remaining ETA in minutes, active route selector, and traffic alerts.

### 3. Transparent Hospital Booking & Tariffs
- Transparent tariff calculator covering doctor consultation fees, bed charges (General vs ICU), ambulance dispatch fees, and insurance copay deductions.
- Pre-authorized emergency appointment letter printable directly from the browser.

### 4. Full-Stack User Authentication
- Complete Sign Up (`/api/auth/register`, `/api/auth/signup`) and Sign In (`/api/auth/login`) workflows.
- Passwords cryptographically hashed using **bcrypt** (10 salt rounds).
- Stateless **JWT session tokens** containing user ID, role, and email.
- Account status enforcement: Deactivated accounts are blocked at login with HTTP 403.

### 5. Dedicated User Dashboard
- Welcome banner with live status and role tags.
- Detailed profile card (Full Name, Email, Mobile, Role, Account Status, Registration Date).
- Direct access to triage, navigation, ambulance dispatch, and past emergency records.

### 6. Administrator Control Center (`/admin`)
- **Access Guard**: Strictly enforces `role === 'admin'`.
- **Overview Metrics**: Total Users, Active Users, Deactivated Users, New Registrations (7 Days).
- **User Management Panel**: Search by name/email/phone, filter by role and status, view details modal, edit user details, toggle account activation, and delete users.
- **Self-Protection Guardrails**: Administrators cannot deactivate or delete their own active account.
- **Hospital Capacity Synchronizer**: Live bed count increment/decrement and emergency triage status updates.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 5 | Reactive UI with fast Hot Module Replacement |
| **Styling** | Tailwind CSS 3 | Modern aesthetics, glassmorphism, responsive grid |
| **Icons** | Lucide React | Clean, accessible vector icons |
| **Maps** | Leaflet.js | Interactive live GPS tracking and route corridors |
| **Backend** | Node.js 24, Express 5 | MVC REST API service |
| **Database** | Supabase PostgreSQL 17 | Relational database with Row Level Security (RLS) |
| **Security** | bcryptjs, jsonwebtoken | Password hashing & stateless session tokens |

---

## 📐 System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   React.js Frontend                    │
│      (Vite Client • http://localhost:5173)             │
└───────────┬────────────────────────────────┬───────────┘
            │ 1. API Calls via src/lib/api.js│ 2. Direct realtime
            │    (Bearer JWT Token)          │    hospital reads
            ▼                                ▼
┌─────────────────────────┐      ┌──────────────────────┐
│  Express.js Backend     │      │   Supabase Client    │
│  (MVC REST API • :5000) │      │   (@supabase/js)     │
└───────────┬─────────────┘      └──────────┬───────────┘
            │                               │
            │ Node-Supabase Bridge          │ Realtime Listeners
            ▼                               ▼
┌────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database              │
│  • public.users               • public.beds            │
│  • public.hospitals           • public.ambulances      │
│  • public.doctors             • public.hospital_cards  │
│  • public.emergency_requests  • Row Level Security     │
└────────────────────────────────────────────────────────┘
```

---

## 📂 Folder Structure

```text
Alpha-to-do/
├── frontend/
│   ├── src/                  # React components, pages, context, and lib
│   ├── public/               # Public assets
│   ├── index.html            # Vite HTML template
│   ├── package.json          # Frontend dependencies & scripts
│   ├── vite.config.js        # Vite build configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── postcss.config.js     # PostCSS configuration
│   ├── .env.example          # Frontend environment variables template
│   └── README.md             # Frontend specific documentation
├── backend/
│   ├── config/               # Database client connection
│   ├── controllers/          # Request handlers (auth, admin)
│   ├── middleware/           # JWT & role authorization middleware
│   ├── models/               # Data access layer for public.users
│   ├── routes/               # API route definitions (/api/auth, /api/admin)
│   ├── utils/                # JWT and bcrypt utility functions
│   ├── server.js             # Express server entry point (Port 5000)
│   ├── package.json          # Backend dependencies & scripts
│   ├── .env.example          # Backend environment variables template
│   └── README.md             # Backend specific documentation
├── database/
│   ├── schema.sql            # Complete PostgreSQL table schemas & RLS
│   └── seed.sql              # Seed data (users, hospitals, beds, doctors)
├── .env.example              # Master environment template
├── .gitignore                # Git ignore configuration
├── package.json              # Root mono-repo scripts
├── test_integration.mjs      # 16-point automated integration test suite
└── README.md                 # Complete project documentation
```

---

## 🗄️ Database & Supabase Setup

The database schema and seed data are stored in [database/schema.sql](file:///d:/hackathon/database/schema.sql) and [database/seed.sql](file:///d:/hackathon/database/seed.sql).

### Key Tables
1. **`public.users`**: Primary authentication table (`id`, `full_name`, `email`, `mobile`, `password_hash`, `role`, `status`, `created_at`, `updated_at`).
2. **`public.hospitals`**: Hospital directory (`id`, `name`, `image_url`, `address`, `city`, `latitude`, `longitude`, `phone`, `emergency_phone`, `emergency_status`, `rating`, `distance_km`, `eta_minutes`).
3. **`public.beds`**: Real-time bed availability (`general_available`, `icu_available`, `emergency_available`, `ventilator_available`, `oxygen_available`).
4. **`public.doctors`**: Doctors on duty with specialization and availability status.
5. **`public.ambulances`**: Ambulance fleet with type (`ALS`, `BLS`, `ACLS`, `ICU on Wheels`), status, and GPS coordinates.
6. **`public.insurance_cards`** & **`public.hospital_cards`**: Cashless insurance schemes mapped to hospitals.
7. **`public.emergency_requests`**: Audit log of emergency bookings and dispatched requests.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
# Backend Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_in_production
FRONTEND_URL=http://localhost:5173

# Supabase PostgreSQL Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Frontend Configuration (Vite)
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

---

## 📡 API Endpoints

### Authentication Endpoints (`/api/auth`)
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user with bcrypt hash & default role `'user'` |
| `POST` | `/api/auth/signup` | Public | Alias for register |
| `POST` | `/api/auth/login` | Public | Authenticate user, check status, return signed JWT |
| `POST` | `/api/auth/logout` | Public | Invalidate session |
| `GET` | `/api/auth/me` | Bearer Token | Return authenticated user details (no password hash) |

### Admin Control Endpoints (`/api/admin`)
*All admin endpoints require `Authorization: Bearer <token>` with `role === 'admin'`.*

| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | Total, Active, Deactivated, and New (7 Days) metrics |
| `GET` | `/api/admin/users` | Admin | Filter users by search query, role, and status |
| `GET` | `/api/admin/users/:id` | Admin | Retrieve single user record |
| `PUT` | `/api/admin/users/:id` | Admin | Update user details (Name, Mobile, Role, Status) |
| `PATCH` | `/api/admin/users/:id/status` | Admin | Toggle account status (`active` ↔ `deactivated`) |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Update user role (`user` ↔ `admin`) |
| `DELETE` | `/api/admin/users/:id` | Admin | Permanently delete user account |

---

## 🔑 Test Credentials

| Role | Email | Password | Status | Destination |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@emergencycare.app` | `Admin@123` | `active` | Redirects to `/admin` (Admin Control Center) |
| **User** | `user@emergencycare.app` | `User@123` | `active` | Redirects to User Dashboard (`user-dashboard`) |
| **Inactive** | `inactive@emergencycare.app` | `User@123` | `deactivated` | Blocked at login with HTTP 403 & warning banner |

*(All 3 test accounts can be filled into the Sign In page with a single click using the quick fill buttons).*

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server (Port 5000)
```bash
npm run server
```

### 3. Start Frontend Client (Port 5173)
```bash
npm run dev
```

### 4. Run Automated End-to-End Test Suite
```bash
node test_integration.mjs
```

---

## 📦 How to Build & Deploy

### Production Build
```bash
npm run build
```
Compiled production files are output to `dist/`.

### Deployment Checklist
- Set `NODE_ENV=production` in the production environment.
- Set a strong, random `JWT_SECRET`.
- Update `VITE_API_URL` to point to your live backend domain (e.g. `https://api.yourdomain.com/api`).
- Update `FRONTEND_URL` in backend `.env` to match your deployed frontend domain.

---

## ⚠️ Troubleshooting & Common Errors

1. **`Port 5000 is already in use`**
   - Check if another node process is running: `Get-Process node` and stop it, or configure a different port in `.env` (`PORT=5001`).
2. **`Account deactivated` error on Sign In**
   - This occurs when `status === 'deactivated'`. Log in with an administrator account and set the user's status back to `active` via the Admin Panel.
3. **`Session expired or invalid token`**
   - Stored JWT expired or was modified. Sign in again to refresh the token.
4. **Vite dev server opens on a different port**
   - If port 5173 is busy, Vite uses 5174. Make sure backend `FRONTEND_URL` or CORS allows requests from this port.
