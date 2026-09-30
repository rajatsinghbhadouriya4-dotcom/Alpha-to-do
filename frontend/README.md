# 🚑 EmergencyCare Frontend — React + Vite Client

> React 18 + Vite + Tailwind CSS + Leaflet Maps + Lucide Icons

This frontend client powers the EmergencyCare user experience, providing real-time decision intelligence, ambulance tracking, transparent hospital booking, and a dedicated authentication and administrator control portal.

---

## 🏗️ Frontend Directory Structure

```text
src/
├── assets/                       # Static branding and icons
├── components/
│   ├── auth/
│   │   ├── SignInPage.jsx        # Login page with demo credentials & status alerts
│   │   └── SignUpPage.jsx        # Registration page with field validation
│   ├── AdminView.jsx             # Admin Control Center (Metrics, Users Table, Modals)
│   ├── UserDashboard.jsx         # User profile card & quick emergency actions
│   ├── Header.jsx                # Responsive navbar with triage alert & role badges
│   ├── DecisionIntelligenceView.jsx # Core triage ranking & decision factors
│   ├── DecisionComparisonView.jsx # Side-by-side hospital comparison matrix
│   ├── LiveAmbulanceTracker.jsx  # Interactive Leaflet map with traffic & telemetry
│   ├── BookingModal.jsx          # Bed pre-booking & transparent tariff calculator
│   ├── EmergencySummaryReceipt.jsx # Official printable appointment receipt
│   ├── RouteView.jsx             # Multi-route corridor & traffic signal view
│   ├── HospitalDetailsView.jsx   # Hospital detail, beds, doctors, and reviews
│   └── ProfileView.jsx           # Patient medical profile & insurance editor
├── context/
│   └── AppContext.jsx            # Global state (auth, GPS, hospitals, active bookings)
├── lib/
│   ├── api.js                    # Centralized API fetch client (VITE_API_URL)
│   ├── supabase.js               # Supabase client & fallback data
│   ├── geoUtils.js               # Haversine distance & geocoding
│   └── pricingData.js            # Transparent tariff calculation models
├── App.jsx                       # Master layout & client-side PageRouter
├── index.css                     # Tailwind CSS directives & custom animations
└── main.jsx                      # Vite React entry point
```

---

## ⚙️ Environment Variables

The frontend reads configuration from `.env` via Vite's `import.meta.env`:

| Variable | Description | Default Fallback |
| :--- | :--- | :--- |
| `VITE_API_URL` | Express backend base URL | `http://localhost:5000/api` |
| `VITE_SUPABASE_URL` | Supabase API URL | Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key | Legacy anon key |

---

## 🔄 Frontend ↔ Backend Communication

All network communication with the backend is routed through [src/lib/api.js](file:///d:/hackathon/src/lib/api.js):

1. **Authentication State**:
   - Stored in `localStorage` as `emergency_care_token` and `emergency_care_user`.
   - On application startup, [src/context/AppContext.jsx](file:///d:/hackathon/src/context/AppContext.jsx) calls `authAPI.getMe()` to verify the token with the Express backend.
   - If an account has been deactivated, the session is cleared and the user is redirected to sign in with an alert.
2. **Role-Based Routing**:
   - `admin` role navigates to the **Admin Control Center** (`AdminView`).
   - `user` role navigates to the **User Dashboard** (`UserDashboard`).
   - Unauthenticated visitors have access to the triage engine, interactive map, and emergency hospital discovery.

---

## 🚀 Running the Frontend

From the workspace root directory:

```bash
# Run local dev server with hot module replacement (HMR)
npm run dev
```

Server will start on `http://localhost:5173/`.

### Building for Production
```bash
npm run build
```
Production assets are generated in `dist/`.

---

## ⚠️ Troubleshooting & Common Errors

1. **`NetworkError when attempting to fetch resource`**
   - Ensure the Express backend server is running on port `5000` (`npm run server`).
2. **`Vite port 5173 in use`**
   - Vite will automatically attempt the next available port (e.g., `5174`). If so, update `FRONTEND_URL` in `.env`.
3. **Map tiles not loading**
   - Ensure internet connectivity for OpenStreetMap / Leaflet tile requests.
4. **Styles look broken**
   - Run `npm run build` or ensure Tailwind CSS is built properly via `postcss.config.js`.
