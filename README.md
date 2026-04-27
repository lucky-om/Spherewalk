# 🌐 SphereWalk — Smart Campus Explorer

> **An AI-powered, GPS-driven Campus Navigation & Virtual Tour Platform**

[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)](./LICENSE)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Backend on Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)

---

## 📖 About

**SphereWalk** is a full-stack smart campus web application built for **SCET Surat**. It combines real-world GPS navigation, 360° virtual tours, an AI campus assistant, and a 3D interactive campus map into a single, mobile-first platform.

Developed and owned by **Lucky** — All Rights Reserved.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧭 **AR Navigation** | Real-time GPS + compass-based augmented reality navigation to campus locations |
| 🌐 **360° Virtual Tour** | Pannellum-powered immersive panoramic tours with hotspot navigation |
| 🗺️ **3D Campus Map** | WebGL-powered interactive 3D map with all campus buildings |
| 🤖 **AI Campus Assistant** | Gemini-powered chatbot with full campus knowledge base |
| 📸 **Computer Vision** | COCO-SSD TensorFlow.js object detection overlaid on AR camera feed |
| 🚨 **Emergency Contacts** | Quick-access emergency numbers and campus safety info |
| 🔐 **Admin Dashboard** | JWT-secured admin panel for managing locations, tours, and analytics |
| 🌙 **Dark / Light Mode** | Full theme support across all pages |

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + **Vite** (SPA)
- **@react-three/fiber** + **@react-three/drei** (3D Map)
- **Pannellum** (360° viewer)
- **TensorFlow.js COCO-SSD** (AR object detection)
- **Vanilla CSS** (custom design system, no Tailwind)

### Backend
- **Node.js** + **Express**
- **better-sqlite3** (embedded database)
- **bcrypt** + **JWT** (authentication)
- **Google Gemini API** (AI assistant)
- **Helmet** + **CORS** + **rate-limiter** (security)

---

## 📁 Project Structure

```
campus-explorer/
├── frontend/                  # React + Vite SPA
│   ├── public/
│   │   └── tour/              # 360° panoramic JPEG images
│   └── src/
│       ├── components/        # Navbar, Footer, Guide FAB
│       ├── pages/             # All route pages
│       │   ├── Landing.jsx    # Home page
│       │   ├── ARNavigation.jsx  # GPS AR system
│       │   ├── CampusMap.jsx  # 2D + 3D map
│       │   ├── VirtualTour.jsx   # 360° tour
│       │   ├── AIAssistant.jsx   # AI chatbot
│       │   ├── AdminDashboard.jsx
│       │   ├── Emergency.jsx
│       │   ├── PrivacyPolicy.jsx
│       │   └── TermsOfUse.jsx
│       └── services/
│           └── api.js         # Axios API client
│
└── backend/                   # Node.js + Express API
    └── src/
        ├── data/
        │   ├── db.js          # SQLite schema + seed
        │   └── knowledgeBase.js  # Campus locations + GPS coords
        ├── routes/
        │   ├── auth.js        # JWT authentication
        │   ├── chat.js        # Gemini AI chatbot
        │   ├── locations.js   # Campus locations CRUD
        │   └── tours.js       # Virtual tour management
        └── server.js
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | `https://spherewalk.vercel.app` |
| Backend | Render | `https://spherewalk.onrender.com` |

### Deploy Frontend (Vercel)
- Root: `frontend/`
- Build command: `npm run build`
- Output: `dist/`

### Deploy Backend (Render)
- Root: `backend/`
- Build command: `npm install`
- Start command: `node src/server.js`
- Set all environment variables in Render Dashboard → Environment

---

## 🔒 Security

- JWT-based authentication with 8-hour token expiry
- bcrypt password hashing (cost factor 12)
- Helmet.js security headers
- Content Security Policy (CSP) configured
- Rate limiting on all API endpoints
- Input validation and sanitization

---

## 📷 Screenshots

> AR Navigation · 3D Campus Map · 360° Virtual Tour · AI Assistant

---

## 📄 License

**Copyright © 2026 Lucky. All Rights Reserved.**

This software is proprietary. Unauthorized copying, distribution, modification, or use of this software, in whole or in part, is strictly prohibited without prior written permission from the author.

See [LICENSE](./LICENSE) for full terms.

---

## 👤 Author

**Lucky**  
Full-Stack Developer | Ethical Hacker  
GitHub: [@lucky-om](https://github.com/lucky-om)

---

*SphereWalk — Navigate your campus smarter.*
