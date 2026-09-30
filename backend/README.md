# 🚑 EmergencyCare Backend — MVC REST API

> Express.js + Supabase PostgreSQL + JWT Authentication + bcrypt Password Security

This backend provides a secure Model-View-Controller (MVC) API service for the EmergencyCare emergency triage and hospital decision intelligence platform.

---

## 🏗️ Architecture (MVC)

```text
backend/
├── config/
│   └── db.js                 # Supabase PostgreSQL client instance
├── controllers/
│   ├── authController.js     # User registration, login, profile, and logout
│   └── adminController.js    # Statistics, User CRUD, Role/Status mutation
├── middleware/
│   └── authMiddleware.js     # authenticateUser (JWT verify) & authorizeAdmin
├── models/
│   └── userModel.js          # Data Access Object for public.users table
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   └── adminRoutes.js        # /api/admin routes (protected)
├── utils/
│   ├── jwt.js                # Token signing & verification
│   └── password.js           # bcrypt password hashing (10 salt rounds)
└── server.js                 # Express application entry point (Port 5000)
```

---

## ⚙️ Environment Variables

The backend loads configuration from `.env` in the project root:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port the Express server listens on | `5000` |
| `NODE_ENV` | Runtime environment | `development` or `production` |
| `JWT_SECRET` | Secret key used to sign and verify JWTs | *Keep private and random* |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase API access key | `eyJhbGci...` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |

---

## 📡 API Endpoints

### 1. Health Check
- **`GET /api/health`**
  - **Access**: Public
  - **Response**: `{ status: "healthy", service: "EmergencyCare Backend MVC API", version: "1.0.0" }`

### 2. Authentication (`/api/auth`)
- **`POST /api/auth/register`** (or **`POST /api/auth/signup`**)
  - **Access**: Public
  - **Body**: `{ full_name, email, mobile, password, confirmPassword }`
  - **Validation**: Checks field presence, email syntax, min 6-char password, password confirmation match, and email uniqueness.
  - **Password Security**: Hashes password using `bcryptjs` with 10 salt rounds.
  - **Response**: `201 Created` with signed JWT token and user details (`password_hash` is never exposed).
- **`POST /api/auth/login`**
  - **Access**: Public
  - **Body**: `{ email, password }`
  - **Validation**: Verifies bcrypt hash.
  - **Deactivated Account Check**: If user `status === 'deactivated'`, returns `403 Forbidden` with code `ACCOUNT_DEACTIVATED`.
  - **Response**: `200 OK` with JWT token and user profile.
- **`GET /api/auth/me`**
  - **Access**: Authenticated (`Authorization: Bearer <token>`)
  - **Response**: `200 OK` with verified user profile.
- **`POST /api/auth/logout`**
  - **Access**: Public
  - **Response**: `200 OK`

### 3. Administrator Controls (`/api/admin`)
*All admin endpoints require `Authorization: Bearer <token>` and `role === 'admin'`.*

- **`GET /api/admin/stats`**
  - **Response**: Total users, active accounts, deactivated accounts, and new registrations (last 7 days).
- **`GET /api/admin/users?search=&role=&status=&page=&limit=`**
  - **Response**: Paginated users list with search and filter capabilities.
- **`GET /api/admin/users/:id`**
  - **Response**: Detailed user information.
- **`PUT /api/admin/users/:id`**
  - **Body**: `{ full_name, mobile, role, status }`
  - **Self-Protection**: Administrators cannot remove their own admin privileges or deactivate their own account.
- **`PATCH /api/admin/users/:id/status`**
  - **Body**: `{ status: 'active' | 'deactivated' }`
- **`PATCH /api/admin/users/:id/role`**
  - **Body**: `{ role: 'user' | 'admin' }`
- **`DELETE /api/admin/users/:id`**
  - **Self-Protection**: Administrators cannot delete their own account.

---

## 🚀 Running the Backend

From the workspace root directory:

```bash
# Start backend Express server on port 5000
npm run server
```

Or directly with Node:
```bash
node backend/server.js
```

---

## 🧪 Testing

Run the automated integration test suite:
```bash
node test_integration.mjs
```

---

## ⚠️ Troubleshooting & Common Errors

1. **`EADDRINUSE: address already in use :::5000`**
   - Another process is using port 5000. Stop it or configure a different port in `.env` (`PORT=5001`).
2. **`Session expired or invalid token` (401)**
   - Ensure the `Authorization` header is formatted as `Bearer <token>`.
3. **`Account deactivated` (403)**
   - The user account was set to `status = 'deactivated'` by an administrator. An admin must set `status = 'active'` in the Admin Panel or database.
4. **`Missing SUPABASE_URL or SUPABASE_KEY`**
   - Check `.env` and verify valid Supabase credentials are provided.
