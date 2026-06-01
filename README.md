<div align="center">

# 🌊शंखCall🌳

### Real-Time Citizen Disaster Reporting & Environmental Monitoring Platform

*A unified platform for citizens and officials to report, monitor, and analyze environmental hazards across India — in their own language.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📖 Overview

**शंखCall** (ShankhCall) is a full-stack web application that enables citizens to submit real-time disaster and environmental hazard reports, while officials and analysts can monitor, verify, and act on those reports through an interactive dashboard.

The platform currently supports two environmental monitoring boards — **Forest** (wildfires, illegal logging, poaching) and **Ocean** (flooding, tsunamis, wave surges) — with geospatial heatmaps, sentiment analysis, and live social feeds, all available in **8 Indian languages**.

---

## ✨ Features

### 🔐 Authentication
- Multi-step role-based sign-up (Citizen / Official)
- Firebase Authentication with real email verification
- Secure sign-in with error handling for invalid credentials

### 🗺️ Interactive Disaster Dashboards
- **Forest Board** — monitor wildfires, poaching, illegal logging, deforestation
- **Ocean Board** — track floods, tsunamis, wave surges, coastal erosion
- Real-time Leaflet.js map with **heatmap density overlays** and **marker clustering**
- Jump-to-location for key Indian regions (Jim Corbett, Kaziranga, Sunderbans, Western Ghats, Gir, Shimla)
- Zoom controls and live coordinate display

### 📋 Citizen Reporting
- Submit hazard reports with description, location, event type, and timestamp
- Media attachment support (photos/videos)
- Consent-based submission flow
- Reports stored in Firestore in real-time

### 🧠 Built-in NLP Engine
- Keyword-based text classification for Forest and Ocean hazard categories (supports English + Hindi transliteration)
- Sentiment scoring (negative/positive) with multilingual keyword dictionaries covering English and Hindi
- Used to auto-tag incoming social posts and citizen reports

### 📊 Analytics
- Chart.js powered trend graphs and sentiment distribution charts
- Live social media post monitor with NLP-tagged results
- Filter by event type, source, date range, and keyword search

### 🌐 Multilingual Support
- Full UI translation across **8 Indian languages**:
  `English · Hindi · Bengali · Marathi · Telugu · Tamil · Kannada · Assamese`

### 🎨 UI/UX
- Dark / Light theme toggle
- Animated canvas particle effects (mouse-reactive)
- Glassmorphism card design with gradient orbs and floating SVG leaves
- Fully responsive layout for mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + PostCSS |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Maps | Leaflet.js + leaflet.heat + leaflet.markercluster |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| Linting | ESLint 9 |

---

## 📁 Project Structure

```
shankhcall/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Login / Sign-up page
│   │   ├── select/page.tsx           # Disaster type selector
│   │   ├── disaster/
│   │   │   ├── forest/page.tsx       # Forest monitoring dashboard
│   │   │   └── ocean/page.tsx        # Ocean monitoring dashboard
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── LeafletMap.tsx            # Interactive map component
│   │   ├── ReportModal.tsx           # Citizen report submission modal
│   │   ├── MediaViewerModal.tsx      # Media preview modal
│   │   └── ThemeToggle.tsx           # Dark/Light theme toggle
│   ├── lib/
│   │   ├── firebase.ts               # Firebase app initialization
│   │   ├── store.ts                  # Global state store
│   │   ├── i18n.ts                   # Multilingual translations
│   │   └── nlp.ts                    # Text classification & sentiment engine
│   └── types/
│       └── leaflet-plugins.d.ts      # Type declarations for Leaflet plugins
├── public/
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or above
- A [Firebase](https://firebase.google.com/) project with Firestore, Authentication, and Storage enabled

### 1. Clone the repository

```bash
git clone https://github.com/Viidhyanshu/shankhcall.git
cd shankhcall
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory and add your Firebase project credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> Get these values from your Firebase Console → Project Settings → Your Apps.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ App Flow

```
/ (Login / Sign-up)
    ↓
/select (Choose: Forest or Ocean)
    ↓                    ↓
/disaster/forest    /disaster/ocean
  - Heatmap           - Heatmap
  - Reports Feed      - Reports Feed
  - NLP Monitor       - NLP Monitor
  - Charts            - Charts
```

---

## 🌍 Supported Languages

| Code | Language |
|---|---|
| `en` | English |
| `hi` | Hindi (हिंदी) |
| `bn` | Bengali (বাংলা) |
| `mr` | Marathi (मराठी) |
| `te` | Telugu (తెలుగు) |
| `ta` | Tamil (தமிழ்) |
| `kn` | Kannada (ಕನ್ನಡ) |
| `as` | Assamese (অসমীয়া) |

---

## 🔮 Roadmap

- [ ] Add more disaster categories (Earthquake, Cyclone, Flood)
- [ ] Official report verification and status chips
- [ ] Push notifications for high-severity alerts
- [ ] Mobile app (React Native)
- [ ] Government agency API integration
- [ ] ML-based image classification for media attachments

---



## 👨‍💻 Author

**Vidhyanshu**  [GitHub](https://github.com/Viidhyanshu)
**Roséhead**  [GitHub](https://github.com/roseehead)
---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <i>Built with ❤️ for India — because every disaster report matters.</i>
</div>
