# 🌐 SphereWalk: Virtual Campus Explorer (SCET Surat)

**SphereWalk** is a high-end, immersive virtual walkthrough solution built for **Sarvajanik College of Engineering & Technology (SCET), Surat**. Developed for **SCETATHON 2026**, this platform solves the problem of campus navigation by providing a hierarchical 360° tour and AR-integrated guidance.



## 🌌 Project Vision
To transform the SCET campus into a globally accessible digital twin, allowing students, parents, and visitors to explore labs, departments, and facilities through a "Dark Neon" premium web experience.

## 🚀 Core Features
* **Hierarchical Navigation**: Structured flow from **Campus Entrance → Department (Computer, IT, etc.) → Specific Lab/Room**.
* **Immersive 360° View**: Uses `Pannellum.js` to render mobile-captured panoramas into interactive spheres.
* **AR Live View**: Uses WebRTC and HTML5 Canvas to overlay navigation tags on the user's mobile camera feed.
* **Non-Coding Admin Panel**: A secure dashboard for SCET staff to upload new 360° images and update room info without touching the code.
* **QR Code Entry**: Physical QR codes placed at lab doors link directly to that specific virtual room.
* **Interactive Neon Map**: A custom-styled Leaflet.js map centered on SCET Surat.



## 🛠️ Tech Stack (Zero-Investment)
- **Frontend**: React 18+, Vite, React Router
- **360 Engine**: Pannellum.js
- **AR Engine**: WebRTC API + HTML5 Canvas
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3) — *File-based, no hosting cost.*
- **Auth**: JWT + bcrypt
- **Cloud Storage**: Cloudinary (Free Tier) for image hosting

## 📂 File Structure
```text
spherewalk/
├── backend/                # Node.js + Express API
│   ├── data/               # SQLite DB file (database.sqlite)
│   ├── routes/             # API Endpoints (Admin, Campus, Rooms)
│   └── server.js           # Entry Point
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # PanoViewer.jsx, ARViewer.jsx, Map.jsx
│   │   ├── pages/          # Campus.jsx, Dept.jsx, Room.jsx, Admin.jsx
│   │   └── styles/         # Neon-Dark Global CSS
└── README.md
```
## 🏆 Hackathon Credits :
Event: SCETATHON 2026

Team ID: SCET2026-058

Team Name: The Green Node

Team Members :
1. Patel Jeet
2. Patel Akshit
3. Patel Daksh
4. Patel Om
5. Jariwala Devansh

Live Website : https://spherewalk.greennode.in
