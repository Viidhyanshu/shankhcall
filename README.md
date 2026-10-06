<div align="center">

# 🌊 शंखCall 🌳

### Real-Time Citizen Disaster Reporting & Environmental Monitoring Platform

*A unified platform for citizens and officials to report, monitor, and analyze environmental hazards across India — in their own language.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4-black?style=for-the-badge&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Neon Database](https://img.shields.io/badge/Neon_Postgres-Serverless-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=for-the-badge)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📖 Overview

**शंखCall** (ShankhCall) is a full-stack, decoupled web application that enables citizens to submit real-time environmental hazard reports while officials monitor, verify, and respond through interactive dashboards.

The platform provides dedicated boards for **Forest hazards** (wildfires, illegal logging, poaching) and **Ocean hazards** (flooding, high waves, storm surges) with geospatial heatmaps, NLP sentiment analysis, and multilingual support in **8 Indian languages**.

---

## 🏗️ High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 16)"]
        UI["React 19 User Interface"]
        F_MW["Next.js Edge Middleware (src/middleware.ts)"]
        API_Client["API Client (src/lib/api.ts)"]
        Store["Live Disaster Store (src/lib/store.ts)"]
    end

    subgraph Server["Backend API (Express.js + TypeScript)"]
        B_Server["Express Server (Port 5001)"]
        B_MW["Auth Middleware (authenticate / requireOfficial)"]
        AuthRoutes["Auth Routes (/api/auth)"]
        ReportRoutes["Report Routes (/api/reports)"]
        Drizzle["Drizzle ORM"]
    end

    subgraph Database["Database (Neon Serverless PostgreSQL)"]
        UsersTbl[("users Table")]
        SessionsTbl[("sessions Table")]
        ReportsTbl[("reports Table")]
    end

    UI --> F_MW
    F_MW -->|Session Cookie Valid| UI
    UI --> Store
    Store --> API_Client
    API_Client -->|HTTP + Credentials: Include| B_Server

    B_Server --> B_MW
    B_MW --> AuthRoutes
    B_MW --> ReportRoutes

    AuthRoutes --> Drizzle
    ReportRoutes --> Drizzle

    Drizzle --> UsersTbl
    Drizzle --> SessionsTbl
    Drizzle --> ReportsTbl
```

---

## 🔄 Detailed Code Flowcharts

### 1. Authentication & Session Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen / Official
    participant NextMW as Next.js Middleware
    participant Frontend as Next.js Client (Port 3000)
    participant Backend as Express API (Port 5001)
    participant Neon as Neon PostgreSQL (Drizzle)

    User->>Frontend: Fill Sign Up / Sign In Form
    Frontend->>Backend: POST /api/auth/signin or /signup (JSON)
    Backend->>Neon: Query user credentials / Hash password (crypto.scryptSync)
    Neon-->>Backend: User record verified / created
    Backend->>Neon: INSERT INTO sessions (sessionId, userId, expiresAt)
    Backend-->>Frontend: Set-Cookie: session_token (httpOnly, secure) + User Profile JSON
    Frontend->>Frontend: Redirect to /select

    Note over NextMW,Frontend: Subsequent Page Navigation (/select or /disaster/*)
    Frontend->>NextMW: Request protected page
    NextMW->>NextMW: Check request.cookies.get('session_token')
    alt Token Missing
        NextMW-->>Frontend: Redirect to / (Login)
    else Token Present
        NextMW-->>Frontend: Render Protected Page
    end
```

---

### 2. Disaster Report Submission & Live Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen Reporter
    participant Modal as ReportModal & NLP Engine
    participant Store as useDisasterStore
    participant API as Express API (/api/reports)
    participant AuthMW as Backend auth.ts Middleware
    participant Neon as Neon PostgreSQL
    actor Official as Official Validator

    Citizen->>Modal: Enter details, coordinates & upload photos
    Modal->>Modal: NLP Engine classifies keywords & scores sentiment
    Modal->>Store: storeActions.addReport(reportData)
    Store->>Store: Optimistic UI update (immediate render on map)
    Store->>API: POST /api/reports (with session_token cookie)
    
    API->>AuthMW: authenticate(req, res, next)
    AuthMW->>Neon: Validate session_token against sessions table
    Neon-->>AuthMW: Session valid (attach req.user)
    AuthMW->>API: next()
    API->>Neon: INSERT INTO reports (id, lat, lng, type, desc, media, sentiment)
    Neon-->>API: 201 Created
    API-->>Store: Confirmed report saved

    Note over Official,Neon: Official Review & Verification
    Official->>Store: Click "Verify Report"
    Store->>API: PATCH /api/reports/:id/verify (session_token)
    API->>AuthMW: authenticate & requireOfficial
    API->>Neon: UPDATE reports SET verified = true WHERE id = :id
    Neon-->>API: Updated record
    API-->>Store: Synchronized state (Map chip turns verified)
```

---

## 📁 Decoupled Folder Structure

```
shankhcall/
├── frontend/                     # Next.js 16 Web Application (Port 3000)
│   ├── public/                   # Static icons, vector assets, and manifest
│   ├── src/
│   │   ├── app/                  # App Router
│   │   │   ├── page.tsx          # Login & Multi-step Sign Up
│   │   │   ├── select/page.tsx   # Disaster Board Selector (Forest / Ocean)
│   │   │   ├── disaster/
│   │   │   │   ├── forest/page.tsx # Forest Monitoring Dashboard & Heatmap
│   │   │   │   └── ocean/page.tsx  # Ocean Monitoring Dashboard & Heatmap
│   │   │   ├── layout.tsx        # Root layout with fonts & theme provider
│   │   │   └── globals.css       # Tailwind CSS v4 design tokens
│   │   ├── components/           # UI Components
│   │   │   ├── LeafletMap.tsx    # Leaflet Map with heatmap & marker clusters
│   │   │   ├── ReportModal.tsx   # Incident report dialog with geolocation
│   │   │   ├── MediaViewerModal.tsx # Photo & video inspection modal
│   │   │   └── ThemeToggle.tsx   # Dark / Light theme switcher
│   │   ├── lib/                  # Frontend Utilities
│   │   │   ├── api.ts            # Typed HTTP client communicating with backend
│   │   │   ├── store.ts          # Central state store synced with backend
│   │   │   ├── i18n.ts           # Multilingual dictionary (8 languages)
│   │   │   └── nlp.ts            # Keyword categorization & sentiment scoring
│   │   ├── middleware.ts         # Edge route protection & cookie guard
│   │   └── types/                # Leaflet & map type declarations
│   ├── .env.local                # Frontend configuration (NEXT_PUBLIC_API_URL)
│   ├── next.config.ts            # Next.js bundler settings
│   ├── tsconfig.json             # Frontend TypeScript configuration
│   └── package.json
│
├── backend/                      # Express + Drizzle + Neon API (Port 5001)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle client initialized with Neon Serverless
│   │   │   └── schema.ts         # Drizzle schema (users, sessions, reports)
│   │   ├── middleware/
│   │   │   └── auth.ts           # Session validation, optionalAuth & role guards
│   │   ├── routes/
│   │   │   ├── auth.ts           # /api/auth (signup, signin, me, signout)
│   │   │   └── reports.ts        # /api/reports (GET, POST, PATCH /verify)
│   │   └── server.ts             # Express app setup, CORS & cookie-parser
│   ├── scripts/
│   │   └── seed.mjs              # Neon database seeder for disaster records
│   ├── .env                      # Backend configuration (DATABASE_URL, PORT)
│   ├── drizzle.config.ts         # Drizzle Kit CLI configuration
│   ├── tsconfig.json             # Backend TypeScript configuration
│   └── package.json
│
├── .gitignore                    # Excludes node_modules, .env, and dist
└── package.json                  # Root monorepo script coordinator
```

---

## 🛠️ Tech Stack Breakdown

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router) | High-performance React server and client rendering |
| **Frontend UI** | [React 19](https://react.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) | Interactive user components with dark/light themes |
| **Mapping Engine** | [Leaflet.js](https://leafletjs.com/) + Plugins | Dynamic heatmaps (`leaflet.heat`) & marker clusters |
| **Backend Runtime** | [Express.js](https://expressjs.com/) on [Node.js](https://nodejs.org/) | RESTful API service running in TypeScript |
| **Database** | [Neon](https://neon.tech/) PostgreSQL | Serverless, scalable cloud PostgreSQL |
| **ORM & Migrations** | [Drizzle ORM](https://orm.drizzle.team/) + Drizzle Kit | Type-safe schema definition and migrations |
| **Authentication** | Server-Side Sessions | Salted password hashing (`crypto.scryptSync`) & HTTP-only cookies |
| **NLP Engine** | Custom In-Memory NLP (`nlp.ts`) | Real-time sentiment scoring & multilingual keyword classification |
| **Charts & Analytics** | [Chart.js](https://www.chartjs.org/) + `react-chartjs-2` | Sentiment breakdowns and disaster category trends |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Neon Database](https://neon.tech/) account (free serverless Postgres)

---

### 1. Installation

Clone the repository and install dependencies for both the frontend and backend:

```bash
git clone https://github.com/Viidhyanshu/shankhcall.git
cd shankhcall

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

---

### 2. Configure Environment Variables

#### Backend Configuration:
Create `backend/.env`:
```env
PORT=5001
FRONTEND_URL=http://localhost:3000
DATABASE_URL='postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-ENDPOINT.neon.tech/neondb?sslmode=require'
```

#### Frontend Configuration:
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

---

### 3. Initialize & Seed the Neon Database

Run the following commands from the project root:

```bash
# Push schema tables (users, sessions, reports) to your Neon database
npm run db:push

# Seed the database with initial forest and ocean hazard reports
npm run db:seed
```

> **Optional:** Open Drizzle Studio in your browser to inspect database rows visually:
> ```bash
> npm run db:studio
> ```

---

### 4. Running the Development Servers

You can run both services from the root folder:

#### Start Backend (API Server):
```bash
npm run dev:backend
# Starts Express server at http://localhost:5001
```

#### Start Frontend (Next.js Application):
```bash
npm run dev:frontend
# Starts Next.js application at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference

All backend endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register user, hash password, create Neon session & cookie |
| `POST` | `/api/auth/signin` | Public | Validate credentials, create Neon session & set cookie |
| `GET` | `/api/auth/me` | Cookie Session | Retrieve currently authenticated user profile |
| `POST` | `/api/auth/signout` | Cookie Session | Invalidate session in Neon database and purge cookie |

### Incident Reports (`/api/reports`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports` | Public | Fetch all disaster reports sorted by timestamp descending |
| `POST` | `/api/reports` | `authenticate` | Submit a new hazard report (coordinates, type, media) |
| `PATCH` | `/api/reports/:id/verify` | `authenticate` | Mark an incident report as officially verified |

---

## 🌍 Multilingual Support

The interface and NLP keyword classifiers support **8 Indian languages**:

| Code | Language | Native Script |
|---|---|---|
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `bn` | Bengali | বাংলা |
| `mr` | Marathi | मराठी |
| `te` | Telugu | తెలుగు |
| `ta` | Tamil | தமிழ் |
| `kn` | Kannada | ಕನ್ನಡ |
| `as` | Assamese | অসমীয়া |

---

## 👨‍💻 Authors & Contributors

- **Vidhyanshu** — [GitHub](https://github.com/Viidhyanshu)
- **Roséhead** — [GitHub](https://github.com/roseehead)

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

<div align="center">
  <i>Built with ❤️ for India — because every disaster report matters.</i>
</div>
