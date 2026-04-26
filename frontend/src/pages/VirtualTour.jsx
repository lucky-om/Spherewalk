/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
/* Coded by Lucky */
import React, { useEffect, useRef, useState } from 'react';
import { getLocations } from '../services/api';
import './VirtualTour.css';



const TOUR_SCENES = {
    admin_entry: {
        title: "Admin Entry", panorama: "/tour/Admin_Entry.jpeg", autoLoad: true,
        hotSpots: [{ pitch: 0, yaw: 0, type: "scene", text: "Go to Admin", sceneId: "admin" }]
    },
    admin: {
        title: "Admin", panorama: "/tour/Admin.jpeg", autoLoad: true,
        hotSpots: [
            { pitch: 0, yaw: 0, type: "scene", text: "Go to Admin Entry", sceneId: "admin_entry" },
            { pitch: 0, yaw: 90, type: "scene", text: "Go to Mid Lobby", sceneId: "lobby_mid" },
            { pitch: 0, yaw: 180, type: "scene", text: "Go to Campus", sceneId: "campus" }
        ]
    },
    lobby_mid: {
        title: "Mid Lobby", panorama: "/tour/Lobby_mid.jpeg", autoLoad: true,
        hotSpots: [
            { pitch: 0, yaw: 95, type: "scene", text: "Go to Admin", sceneId: "admin" },
            { pitch: 0, yaw: -90, type: "scene", text: "Go to Main Lobby", sceneId: "lobby" }
        ]
    },
    auditorium: {
        title: "Auditorium", panorama: "/tour/Auditorium.jpeg", autoLoad: true,
        hotSpots: [
            { pitch: 0, yaw: 0, type: "scene", text: "Go to Campus", sceneId: "campus" },
            { pitch: 0, yaw: 180, type: "scene", text: "Go to Canteen", sceneId: "canteen" }
        ]
    },
    campus: {
        title: "Campus Center", panorama: "/tour/Campus.jpeg", autoLoad: true,
        hotSpots: [
            { pitch: 0, yaw: 140, type: "scene", text: "Go to Admin", sceneId: "admin" },
            { pitch: 0, yaw: 205, type: "scene", text: "Go to Lobby", sceneId: "lobby" },
            { pitch: 0, yaw: 40, type: "scene", text: "Go to Canteen", sceneId: "canteen" },
            { pitch: 0, yaw: 90, type: "scene", text: "Go to Auditorium", sceneId: "auditorium" }
        ]
    },
    canteen: {
        title: "Canteen", panorama: "/tour/Canteen.jpeg", autoLoad: true,
        hotSpots: [
            { pitch: 0, yaw: 75, type: "scene", text: "Go to Campus", sceneId: "campus" },
            { pitch: 0, yaw: -75, type: "scene", text: "Go to Auditorium", sceneId: "auditorium" }
        ]
    },
    lobby: {
        title: "Main Lobby", panorama: "/tour/Lobby.jpeg", autoLoad: true,
        hotSpots: [
            { pitch: -5, yaw: 50, type: "scene", text: "Go to Mid Lobby", sceneId: "lobby_mid" },
            { pitch: 0, yaw: 200, type: "scene", text: "Go to Ground Stairs", sceneId: "stair_ground_floor" },
            { pitch: 0, yaw: 0, type: "scene", text: "Go to Campus", sceneId: "campus" }
        ]
    },
    stair_ground_floor: {
        title: "Ground Floor Stairs", panorama: "/tour/stair_ground_floor.jpeg", autoLoad: true,
        hotSpots: [
            { pitch: -5, yaw: 170, type: "scene", text: "Go to Lobby", sceneId: "lobby" },
            { pitch: 10, yaw: 195, type: "scene", text: "Go Up to 1st Floor", sceneId: "stair_1st_floor" },
            { pitch: -15, yaw: 0, type: "scene", text: "Go Down to Parking", sceneId: "parking" }
        ]
    },
    parking: {
        title: "Parking", panorama: "/tour/Parking.jpeg", autoLoad: true,
        hotSpots: [
            { pitch: 5, yaw: 0, type: "scene", text: "Go Up to Ground Stairs", sceneId: "stair_ground_floor" }
        ]
    },
    stair_1st_floor: {
        title: "1st Floor Stairs", panorama: "/tour/stair_1st_floor.jpeg", autoLoad: true,
        hotSpots: [
            { pitch: -5, yaw: -50, type: "scene", text: "Go Down to Ground Stairs", sceneId: "stair_ground_floor" },
            { pitch: 0, yaw: 185, type: "scene", text: "Go to Lab", sceneId: "lab" }
        ]
    },
    lab: {
        title: "Computer Lab", panorama: "/tour/Lab.jpeg", autoLoad: true,
        hotSpots: [
            { pitch: 0, yaw: 140, type: "scene", text: "Go back to 1st Floor Stairs", sceneId: "stair_1st_floor" }
        ]
    }
};

const TOUR_LIST = [
    { id: 'admin_entry', name: 'Admin Entry', level: 'campus' },
    { id: 'admin', name: 'Admin Block', level: 'campus' },
    { id: 'lobby_mid', name: 'Mid Lobby', level: 'department' },
    { id: 'auditorium', name: 'Auditorium', level: 'campus' },
    { id: 'campus', name: 'Campus Center', level: 'campus' },
    { id: 'canteen', name: 'Canteen', level: 'campus' },
    { id: 'parking', name: 'Parking Area', level: 'campus' },
    { id: 'lobby', name: 'Main Lobby', level: 'department' },
    { id: 'stair_ground_floor', name: 'Ground Floor Stairs', level: 'department' },
    { id: 'stair_1st_floor', name: '1st Floor Stairs', level: 'department' },
    { id: 'lab', name: 'Computer Lab Room', level: 'room' }
];

export default function VirtualTour() {
    const [selectedId, setSelectedId] = useState('admin_entry');
    const [dynamicScenes, setDynamicScenes] = useState(TOUR_SCENES);
    const [dynamicList, setDynamicList] = useState(TOUR_LIST);
    const viewerRef = useRef(null);
    const pannellumRef = useRef(null);

    // Fetch locations with panoramas
    useEffect(() => {
        getLocations().then(res => {
            const locs = res.data.filter(l => l.panoramaUrl && !l.isHidden);
            if (locs.length === 0) return;
            
            const newScenes = { ...TOUR_SCENES };
            const newList = [...TOUR_LIST];
            
            locs.forEach(l => {
                const id = `loc_${l.id}`;
                newScenes[id] = {
                    title: l.name,
                    panorama: l.panoramaUrl,
                    autoLoad: true,
                    hotSpots: []
                };
                newList.push({ id, name: l.name, level: 'room' });
            });
            
            setDynamicScenes(newScenes);
            setDynamicList(newList);
        }).catch(console.error);
    }, []);

    useEffect(() => {
        const init = () => {
            if (!window.pannellum || !viewerRef.current) return;
            try { if (pannellumRef.current) pannellumRef.current.destroy(); } catch { console.error('Error destroying viewer'); }

            // Inject custom hotspot card CSS once
            if (!document.getElementById('pann-hs-style')) {
                const style = document.createElement('style');
                style.id = 'pann-hs-style';
                style.textContent = `
                    /* Hide default pannellum hotspot dot */
                    .pnlm-hotspot { background: none !important; border: none !important; }
                    .pnlm-hotspot:focus { outline: none; }

                    /* Glass card wrapper */
                    .hs-card {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px 13px 8px 9px;
                        border: 1px solid rgba(91,79,233,0.35);
                        border-radius: 13px;
                        background: linear-gradient(135deg,rgba(91,79,233,0.20) 0%,rgba(0,0,0,0.45) 100%);
                        backdrop-filter: blur(14px);
                        -webkit-backdrop-filter: blur(14px);
                        box-shadow: 0 4px 20px rgba(0,0,0,0.40), 0 0 0 1px rgba(91,79,233,0.15);
                        cursor: pointer;
                        white-space: nowrap;
                        transform: translateY(0) scale(1);
                        transition: transform 200ms cubic-bezier(0.34,1.56,0.64,1),
                                    box-shadow 200ms ease,
                                    border-color 200ms ease;
                        animation: hsc-in 350ms ease both;
                        position: relative;
                        overflow: hidden;
                    }
                    @keyframes hsc-in {
                        from { opacity:0; transform: translateY(8px) scale(0.92); }
                        to   { opacity:1; transform: translateY(0)  scale(1);    }
                    }
                    @keyframes hsc-ring {
                        0%   { transform:scale(0.85); opacity:0.7; }
                        100% { transform:scale(2.2);  opacity:0;   }
                    }
                    @keyframes hsc-arrow {
                        0%,100% { transform:translateX(0);  }
                        50%     { transform:translateX(4px); }
                    }
                    @keyframes hsc-shimmer {
                        0%   { background-position:-200% 0; }
                        100% { background-position: 200% 0; }
                    }
                    .hs-card::before {
                        content:'';
                        position:absolute; inset:0;
                        background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%);
                        background-size:200% 100%;
                        background-position:-200% 0;
                        border-radius:inherit;
                        pointer-events:none;
                    }
                    .hs-card:hover::before { animation:hsc-shimmer 600ms ease forwards; }
                    .hs-card:hover {
                        transform: translateY(-3px) scale(1.05);
                        box-shadow: 0 8px 28px rgba(91,79,233,0.45), 0 2px 8px rgba(0,0,0,0.35);
                        border-color: rgba(91,79,233,0.65);
                    }
                    /* Ripple ring */
                    .hs-card-ring {
                        position:absolute; inset:0;
                        border-radius:inherit;
                        border:2px solid rgba(91,79,233,0.55);
                        opacity:0; pointer-events:none;
                    }
                    .hs-card:hover .hs-card-ring { animation:hsc-ring 900ms ease-out infinite; }
                    /* Icon bubble */
                    .hs-card-icon {
                        font-size:1.05rem; line-height:1;
                        display:inline-flex; align-items:center; justify-content:center;
                        width:28px; height:28px; border-radius:8px;
                        background:rgba(91,79,233,0.22);
                        flex-shrink:0;
                    }
                    /* Label */
                    .hs-card-label {
                        font-size:0.78rem; font-weight:700;
                        color:#F2F2F5; letter-spacing:0.01em;
                        font-family:'Inter',-apple-system,sans-serif;
                    }
                    /* Arrow */
                    .hs-card-arrow {
                        font-size:1.1rem; font-weight:700;
                        color:#8B83F5; margin-left:2px;
                    }
                    .hs-card:hover .hs-card-arrow { animation:hsc-arrow 500ms ease-in-out infinite; }
                `;
                document.head.appendChild(style);
            }

            // Build createTooltipFunc helper
            const makeTooltipFn = (hs) => (el) => {
                el.innerHTML = `
                    <div class="hs-card">
                        <div class="hs-card-ring"></div>
                        <span class="hs-card-label">${hs.text}</span>
                        <span class="hs-card-arrow">›</span>
                    </div>`;
            };

            // Clone dynamicScenes and attach createTooltipFunc + clickHandlerFunc to each hotspot
            const scenesWithCards = {};
            Object.entries(dynamicScenes).forEach(([id, scene]) => {
                scenesWithCards[id] = {
                    ...scene,
                    hotSpots: (scene.hotSpots || []).map(hs => ({
                        ...hs,
                        cssClass: 'hs-custom',
                        createTooltipFunc: makeTooltipFn(hs),
                        clickHandlerFunc: () => {
                            if (hs.sceneId && pannellumRef.current) {
                                try { pannellumRef.current.loadScene(hs.sceneId); } catch { /* ignore */ }
                            }
                        }
                    }))
                };
            });

            // Setup pannellum with all scenes
            pannellumRef.current = window.pannellum.viewer(viewerRef.current, {
                default: {
                    firstScene: 'admin_entry',
                    autoLoad: true,
                    sceneFadeDuration: 1000,
                    compass: true,
                    showControls: true
                },
                scenes: scenesWithCards
            });

            // Listen to scene changes so we can update the active sidebar button
            pannellumRef.current.on('scenechange', (sceneId) => {
                setSelectedId(sceneId);
            });
        };


        if (!document.getElementById('pann-css')) {
            const l = document.createElement('link'); l.id = 'pann-css'; l.rel = 'stylesheet';
            l.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
            document.head.appendChild(l);
        }
        if (!window.pannellum) {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
            s.onload = init; document.head.appendChild(s);
        } else {
            // small timeout to ensure DOM is ready
            setTimeout(init, 50);
        }

        return () => { try { pannellumRef.current?.destroy(); } catch { console.error('Error on cleanup'); } };
    }, [dynamicScenes]); // Re-init when scenes change

    // When sidebar item selected, load scene without full re-init
    const handleSelect = (id) => {
        setSelectedId(id);
        if (pannellumRef.current) {
            try { pannellumRef.current.loadScene(id); } catch { /* ignore */ }
        }
    };

    const levels = ['campus', 'department', 'room'];
    const lvlLabel = { campus: 'Campus', department: 'Corridors & Stairs', room: 'Rooms' };

    const currentTour = dynamicList.find(t => t.id === selectedId) || dynamicList[0];

    return (
        <div className="tour-page page">
            <div className="tour-layout">
                <aside className="tour-sidebar">
                    <div className="tour-sidebar-head">
                        <h2>360° Tour</h2>
                        <p>Explore campus spaces</p>
                    </div>
                    <div className="divider" />
                    {levels.map(lv => {
                        const items = dynamicList.filter(t => t.level === lv);
                        if (items.length === 0) return null;
                        return (
                            <div key={lv}>
                                <div className="level-group-head">{lvlLabel[lv]}</div>
                                <div className="scene-card-list">
                                    {items.map((t, i) => (
                                        <button
                                            key={t.id}
                                            className={`scene-card ${selectedId === t.id ? 'active' : ''}`}
                                            onClick={() => handleSelect(t.id)}
                                            style={{ animationDelay: `${i * 60}ms` }}
                                        >
                                            <div className="scene-card-ring" />
                                            <span className="scene-card-label">{t.name}</span>
                                            {selectedId === t.id && (
                                                <span className="scene-card-active-dot" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </aside>
                <main className="tour-main">
                    <div className="tour-breadcrumb">
                        <span>Campus</span>
                        {currentTour.level !== 'campus' && <><span className="sep">›</span><span>{currentTour.level === 'department' ? 'Corridors & Stairs' : 'Rooms'}</span></>}
                        <span className="sep">›</span>
                        <span className="crumb-active">{currentTour.name}</span>
                    </div>

                    {/* Panorama viewer with hotspot overlay cards floating on the image */}
                    <div className="panorama-wrapper">
                        <div id="panorama-viewer" ref={viewerRef} />

                        {/* Hotspot cards overlaid on the panorama image */}
                        <div className="panorama-hotspot-overlay">
                            {dynamicScenes[selectedId]?.hotSpots?.map((h, i) => (
                                <button
                                    key={`${selectedId}-${i}`}
                                    className="hotspot-card"
                                    onClick={() => h.sceneId && handleSelect(h.sceneId)}
                                    style={{ animationDelay: `${i * 90}ms` }}
                                >
                                    <div className="hotspot-card-ring" />
                                    <span className="hotspot-card-label">{h.text}</span>
                                    <span className="hotspot-card-arrow">›</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="tour-info">
                        <div className="tour-info-name">
                            <h3>{currentTour.name}</h3>
                            <span className="tag" style={{ marginTop: '2px' }}>{currentTour.level}</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
