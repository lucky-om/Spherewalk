/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
/* Coded by Lucky */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocations, logSearch } from '../services/api';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Edges } from '@react-three/drei';
import { NODES, CAMPUS_GRAPH, dijkstra, generateNavSteps, getStartNodeForBuilding, getDestNodeForBuilding } from './navigationGraph';
import NavigationPanel from '../components/NavigationPanel';
import NavigationTimeline from '../components/NavigationTimeline';
import './CampusMap.css';

// ─── BUILDINGS (grid layout used by 3D map) ────────────────────────
const BUILDINGS = [
    { id: 'main', label: 'Admin (A)', icon: '', gx: 2, gy: 11, gw: 3, gd: 3, h: 60, color: '#94A3B8', accent: '#64748B', desc: 'Faculty of Architecture', floors: 3 },
    { id: 'cs', label: 'Computer Eng (C)', icon: '', gx: 2, gy: 5, gw: 3, gd: 3, h: 70, color: '#F43F5E', accent: '#E11D48', desc: 'Faculty of Computer Engineering', floors: 3 },
    { id: 'arch-b', label: 'Architecture (B)', icon: '', gx: 2, gy: 8, gw: 3, gd: 3, h: 60, color: '#64748B', accent: '#475569', desc: 'Faculty of Architecture', floors: 3 },
    { id: 'library', label: 'Library (D)', icon: '', gx: 2, gy: 2, gw: 3, gd: 3, h: 50, color: '#E11D48', accent: '#BE123C', desc: 'Central Library', floors: 2 },
    { id: 'elec-e', label: 'Electrical Eng (E)', icon: '', gx: 5, gy: 2, gw: 3, gd: 3, h: 60, color: '#EAB308', accent: '#CA8A04', desc: 'Faculty of Electrical Engineering', floors: 3 },
    { id: 'ec-f', label: 'E & C Eng (F)', icon: '', gx: 8, gy: 2, gw: 3, gd: 3, h: 60, color: '#F87171', accent: '#EF4444', desc: 'Faculty of Electronics & Communication', floors: 3 },
    { id: 'ic-g', label: 'Instrumentation (G)', icon: '', gx: 11, gy: 2, gw: 3, gd: 3, h: 60, color: '#C084FC', accent: '#A855F7', desc: 'Faculty of Instrumentation & Control', floors: 3 },
    { id: 'it', label: 'IT Block (H)', icon: '', gx: 14, gy: 2, gw: 3, gd: 3, h: 70, color: '#10B981', accent: '#059669', desc: 'Faculty of Information Technology', floors: 3 },
    { id: 'chem-j', label: 'Chemical Eng (J)', icon: '', gx: 14, gy: 5, gw: 3, gd: 3, h: 60, color: '#A78BFA', accent: '#8B5CF6', desc: 'Faculty of Chemical Engineering', floors: 3 },
    { id: 'drawing-k', label: 'Drawing Halls (K)', icon: '', gx: 14, gy: 8, gw: 3, gd: 3, h: 50, color: '#84CC16', accent: '#65A30D', desc: 'Drawing Halls', floors: 2 },
    { id: 'textile-l', label: 'Textile Tech (L)', icon: '', gx: 14, gy: 11, gw: 3, gd: 3, h: 60, color: '#EC4899', accent: '#DB2777', desc: 'Faculty of Textile Technology', floors: 3 },
    { id: 'auditorium', label: 'Auditorium', icon: '', gx: 7, gy: 6, gw: 5, gd: 5, h: 45, color: '#CBD5E1', accent: '#94A3B8', desc: 'Central Auditorium', floors: 1 },
];

// ─── ARCHITECTURAL FLOOR PLAN DATA ─────────────────────────────────
// Doors: { wallY, x, w, open }  → horizontal wall at wallY, door from x to x+w, open=1 south/-1 north
//        { wallX, y, h, open }  → vertical wall at wallX, door from y to y+h, open=1 east/-1 west
// Windows: { wallY, x, w } or { wallX, y, h }

const ARCH_PLANS = {
    cs: {
        name: 'CS Block', scale: '1:200', area: '1,800 sqm', floors: [
            {
                label: 'Ground Floor', vw: '0 0 460 310',
                outer: { x: 20, y: 20, w: 420, h: 270 }, W: 7,
                corridors: [{ x: 20, y: 148, w: 420, h: 24 }],
                rooms: [
                    { id: 'CS-101', x: 20, y: 20, w: 208, h: 128, label: 'Computer Lab 1', sub: '60 Workstations', color: '#0EA5E9', icon: '' },
                    { id: 'CS-102', x: 232, y: 20, w: 208, h: 128, label: 'Computer Lab 2', sub: '60 Workstations', color: '#0EA5E9', icon: '' },
                    { id: 'CS-103', x: 20, y: 172, w: 172, h: 118, label: 'Network Lab', sub: 'Cisco / Juniper', color: '#10B981', icon: '' },
                    { id: 'CS-104', x: 196, y: 172, w: 76, h: 118, label: 'Server Room', sub: '24×7 AC', color: '#374151', icon: '' },
                    { id: 'CS-105', x: 276, y: 172, w: 88, h: 58, label: 'HOD Office', sub: 'Prof. Meena Patel', color: '#5B4FE9', icon: '' },
                    { id: 'CS-106', x: 368, y: 172, w: 72, h: 58, label: 'Reception', sub: '', color: '#9CA3AF', icon: '' },
                    { id: 'CS-107', x: 276, y: 234, w: 164, h: 56, label: 'Washrooms', sub: '', color: '#D1D5DB', icon: '' },
                ],
                doors: [
                    { wallY: 148, x: 88, w: 42, open: 1 },
                    { wallY: 148, x: 305, w: 42, open: 1 },
                    { wallY: 172, x: 72, w: 42, open: 1 },
                    { wallY: 172, x: 305, w: 42, open: 1 },
                    { wallY: 20, x: 80, w: 42, open: 1, ext: true },
                    { wallY: 20, x: 298, w: 42, open: 1, ext: true },
                    { wallX: 440, y: 188, h: 42, open: -1 },
                ],
                windows: [
                    { wallY: 20, x: 148, w: 55 }, { wallY: 20, x: 340, w: 55 },
                    { wallY: 290, x: 50, w: 55 }, { wallY: 290, x: 210, w: 55 },
                    { wallX: 20, y: 55, h: 55 }, { wallX: 440, y: 205, h: 55 },
                ],
                cols: [[20, 20], [232, 20], [440, 20], [440, 148], [440, 290], [232, 290], [20, 290], [20, 148], [232, 148]],
                stairs: [{ x: 368, y: 234, w: 72, h: 56 }],
            },
            {
                label: 'First Floor', vw: '0 0 460 310',
                outer: { x: 20, y: 20, w: 420, h: 270 }, W: 7,
                corridors: [{ x: 20, y: 148, w: 420, h: 24 }],
                rooms: [
                    { id: 'CS-201', x: 20, y: 20, w: 296, h: 128, label: 'AI / ML Research Lab', sub: 'GPU Workstations', color: '#8B5CF6', icon: '' },
                    { id: 'CS-202', x: 320, y: 20, w: 120, h: 128, label: 'Cybersecurity Lab', sub: 'Kali · Metasploit', color: '#EF4444', icon: '' },
                    { id: 'CS-203', x: 20, y: 172, w: 96, h: 118, label: 'Faculty Room A', sub: '', color: '#0EA5E9', icon: '' },
                    { id: 'CS-204', x: 120, y: 172, w: 96, h: 118, label: 'Faculty Room B', sub: '', color: '#0EA5E9', icon: '' },
                    { id: 'CS-205', x: 220, y: 172, w: 108, h: 118, label: 'Project Room', sub: '', color: '#F59E0B', icon: '' },
                    { id: 'CS-206', x: 332, y: 172, w: 108, h: 118, label: 'Stairs / Lift', sub: '', color: '#9CA3AF', icon: '' },
                ],
                doors: [
                    { wallY: 148, x: 148, w: 42, open: 1 },
                    { wallY: 148, x: 350, w: 42, open: 1 },
                    { wallY: 172, x: 55, w: 42, open: 1 },
                    { wallY: 172, x: 155, w: 42, open: 1 },
                    { wallY: 172, x: 265, w: 42, open: 1 },
                    { wallY: 20, x: 130, w: 42, open: 1, ext: true },
                    { wallY: 20, x: 352, w: 42, open: 1, ext: true },
                ],
                windows: [
                    { wallY: 20, x: 50, w: 55 }, { wallY: 20, x: 220, w: 55 }, { wallY: 20, x: 370, w: 55 },
                    { wallY: 290, x: 50, w: 55 }, { wallY: 290, x: 220, w: 55 },
                    { wallX: 20, y: 55, h: 55 }, { wallX: 440, y: 55, h: 55 },
                ],
                cols: [[20, 20], [320, 20], [440, 20], [440, 148], [440, 290], [320, 290], [20, 290], [20, 148], [320, 148]],
                stairs: [{ x: 332, y: 172, w: 108, h: 118 }],
            },
            {
                label: 'Second Floor', vw: '0 0 460 310',
                outer: { x: 20, y: 20, w: 420, h: 270 }, W: 7,
                corridors: [],
                rooms: [
                    { id: 'CS-301', x: 20, y: 20, w: 420, h: 185, label: 'Seminar Hall', sub: '200 Seats · Projector · AV System', color: '#8B5CF6', icon: '' },
                    { id: 'CS-302', x: 20, y: 209, w: 196, h: 81, label: 'Research Lab', sub: 'PhD Students', color: '#5B4FE9', icon: '' },
                    { id: 'CS-303', x: 220, y: 209, w: 132, h: 81, label: 'Software Dev Lab', sub: '', color: '#0EA5E9', icon: '' },
                    { id: 'CS-304', x: 356, y: 209, w: 84, h: 81, label: 'Utility & Print', sub: '', color: '#9CA3AF', icon: '' },
                ],
                doors: [
                    { wallY: 205, x: 105, w: 48, open: 1 },
                    { wallY: 205, x: 272, w: 48, open: 1 },
                    { wallY: 205, x: 387, w: 48, open: 1 },
                    { wallY: 20, x: 200, w: 52, open: 1, ext: true },
                ],
                windows: [
                    { wallY: 20, x: 60, w: 70 }, { wallY: 20, x: 240, w: 70 }, { wallY: 20, x: 390, w: 50 },
                    { wallY: 290, x: 50, w: 70 }, { wallY: 290, x: 250, w: 70 },
                    { wallX: 20, y: 60, h: 70 }, { wallX: 440, y: 60, h: 70 },
                ],
                cols: [[20, 20], [440, 20], [440, 205], [440, 290], [220, 290], [20, 290], [20, 205]],
                stairs: [{ x: 356, y: 209, w: 84, h: 81 }],
            },
        ]
    },
    main: {
        name: 'Main Block', scale: '1:200', area: '2,100 sqm', floors: [
            {
                label: 'Ground Floor', vw: '0 0 500 380',
                outer: { x: 20, y: 20, w: 460, h: 340 }, W: 7,
                corridors: [{ x: 20, y: 188, w: 460, h: 24 }],
                rooms: [
                    { id: 'MN-101', x: 20, y: 20, w: 152, h: 168, label: "Principal's Office", sub: 'Dr. Rajesh Sharma', color: '#5B4FE9', icon: '' },
                    { id: 'MN-102', x: 176, y: 20, w: 152, h: 168, label: 'Administration', sub: 'Records & Accounts', color: '#5B4FE9', icon: '' },
                    { id: 'MN-103', x: 332, y: 20, w: 148, h: 168, label: 'Placement Cell', sub: 'Prof. Ramesh Gupta', color: '#8B5CF6', icon: '' },
                    { id: 'MN-104', x: 20, y: 212, w: 136, h: 148, label: 'Reception / Lobby', sub: 'Visitor Entry', color: '#9CA3AF', icon: '' },
                    { id: 'MN-105', x: 160, y: 212, w: 140, h: 148, label: 'Conference Room', sub: '40 Seats', color: '#0EA5E9', icon: '' },
                    { id: 'MN-106', x: 304, y: 212, w: 116, h: 70, label: 'Security Office', sub: 'CCTV Control', color: '#374151', icon: '' },
                    { id: 'MN-107', x: 304, y: 286, w: 116, h: 74, label: 'Stairs / Lift', sub: '', color: '#9CA3AF', icon: '' },
                    { id: 'MN-108', x: 424, y: 212, w: 56, h: 148, label: 'Wash-rooms', sub: '', color: '#D1D5DB', icon: '' },
                ],
                doors: [
                    { wallY: 188, x: 90, w: 46, open: 1 },
                    { wallY: 188, x: 240, w: 46, open: 1 },
                    { wallY: 188, x: 376, w: 46, open: 1 },
                    { wallY: 212, x: 68, w: 46, open: 1 },
                    { wallY: 212, x: 218, w: 46, open: 1 },
                    { wallY: 20, x: 78, w: 46, open: 1, ext: true },
                    { wallY: 20, x: 246, w: 46, open: 1, ext: true },
                    { wallY: 20, x: 398, w: 46, open: 1, ext: true },
                ],
                windows: [
                    { wallY: 20, x: 36, w: 60 }, { wallY: 20, x: 214, w: 60 }, { wallY: 20, x: 368, w: 60 },
                    { wallY: 360, x: 50, w: 60 }, { wallY: 360, x: 220, w: 60 },
                    { wallX: 20, y: 60, h: 60 }, { wallX: 480, y: 60, h: 60 }, { wallX: 480, y: 240, h: 60 },
                ],
                cols: [[20, 20], [176, 20], [332, 20], [480, 20], [480, 188], [480, 360], [176, 360], [20, 360], [20, 188], [304, 188], [304, 212]],
                stairs: [{ x: 304, y: 286, w: 116, h: 74 }],
            },
        ]
    },
};
const DFLT_PLAN = { name: 'Floor Plan', scale: '1:200', area: '—', floors: [{ label: 'Ground Floor', vw: '0 0 300 200', outer: { x: 20, y: 20, w: 260, h: 160 }, W: 7, corridors: [], rooms: [], doors: [], windows: [], cols: [], stairs: [] }] };

// ─── FLOOR PLAN RENDERER ──────────────────────────────────────────
function FloorPlanSVG({ plan, fi }) {
    const floor = plan.floors[fi] || plan.floors[0];
    const { outer, W, rooms, corridors, doors, windows, cols, stairs } = floor;

    const Door = ({ d }) => {
        if (d.wallY !== undefined) {
            const { wallY: y, x, w, open = 1, ext } = d;
            const arcSweep = open > 0 ? 1 : 0;
            return (
                <g>
                    <rect x={x} y={y - W / 2 - 0.5} width={w} height={W + 1} fill="var(--fp-bg)" />
                    {ext && <rect x={x} y={y - W / 2 - 0.5} width={w} height={W + 1} fill="rgba(147,210,255,0.15)" />}
                    <line x1={x} y1={y} x2={x} y2={y + open * w} stroke="var(--fp-door)" strokeWidth="1.5" />
                    <path d={`M${x},${y} A${w},${w} 0 0,${arcSweep} ${x + w},${y}`} fill="none" stroke="var(--fp-door)" strokeWidth="0.9" strokeDasharray="3,2" />
                </g>
            );
        } else {
            const { wallX: x, y, h, open = 1, ext } = d;
            const arcSweep = open > 0 ? 1 : 0;
            return (
                <g>
                    <rect x={x - W / 2 - 0.5} y={y} width={W + 1} height={h} fill="var(--fp-bg)" />
                    {ext && <rect x={x - W / 2 - 0.5} y={y} width={W + 1} height={h} fill="rgba(147,210,255,0.15)" />}
                    <line x1={x} y1={y} x2={x + open * h} y2={y} stroke="var(--fp-door)" strokeWidth="1.5" />
                    <path d={`M${x},${y} A${h},${h} 0 0,${arcSweep} ${x},${y + h}`} fill="none" stroke="var(--fp-door)" strokeWidth="0.9" strokeDasharray="3,2" />
                </g>
            );
        }
    };

    const Win = ({ w: wn }) => {
        if (wn.wallY !== undefined) {
            const { wallY: y, x, w } = wn;
            return <g>
                <line x1={x} y1={y - 2} x2={x + w} y2={y - 2} stroke="var(--fp-win)" strokeWidth="3.5" />
                <line x1={x} y1={y + 2} x2={x + w} y2={y + 2} stroke="var(--fp-win)" strokeWidth="3.5" />
                <line x1={x} y1={y - 2} x2={x + w} y2={y - 2} stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
            </g>;
        } else {
            const { wallX: x, y, h } = wn;
            return <g>
                <line x1={x - 2} y1={y} x2={x - 2} y2={y + h} stroke="var(--fp-win)" strokeWidth="3.5" />
                <line x1={x + 2} y1={y} x2={x + 2} y2={y + h} stroke="var(--fp-win)" strokeWidth="3.5" />
                <line x1={x - 2} y1={y} x2={x - 2} y2={y + h} stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
            </g>;
        }
    };

    const [vx, , vw, vh] = floor.vw.split(' ').map(Number);

    return (
        <svg viewBox={floor.vw} className="fp-svg arch-fp" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid-fp" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M10,0L0,0 0,10" fill="none" stroke="var(--fp-grid)" strokeWidth="0.35" />
                </pattern>
                <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="8" x2="8" y2="0" stroke="var(--fp-hatch)" strokeWidth="1.2" />
                </pattern>
            </defs>

            {/* Background */}
            <rect width={vw + vx * 2} height={vh + vx * 2} fill="var(--fp-bg)" />
            <rect width={vw + vx * 2} height={vh + vx * 2} fill="url(#grid-fp)" />

            {/* Corridors */}
            {corridors.map((c, i) => <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill="var(--fp-corr)" />)}

            {/* Room fills */}
            {rooms.map(r => (
                <g key={r.id}>
                    <rect x={r.x + W / 2} y={r.y + W / 2} width={r.w - W} height={r.h - W} fill={`${r.color}14`} />
                    <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 10} textAnchor="middle" fontSize="13" dominantBaseline="middle">{r.icon}</text>
                    <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 4} textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--fp-text)" fontFamily="Inter,sans-serif">
                        {r.label}
                    </text>
                    {r.sub && <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 13.5} textAnchor="middle" fontSize="5.5" fill="var(--fp-subtext)" fontFamily="Inter,sans-serif">{r.sub}</text>}
                    <text x={r.x + 3} y={r.y + 8} fontSize="4.5" fill={r.color} fontFamily="Inter,sans-serif" fontWeight="700">{r.id}</text>
                </g>
            ))}

            {/* Outer wall */}
            <rect x={outer.x} y={outer.y} width={outer.w} height={outer.h} fill="none" stroke="var(--fp-wall)" strokeWidth={W + 1} strokeLinejoin="miter" />

            {/* Interior room divider walls */}
            {rooms.map(r => <rect key={`w-${r.id}`} x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="var(--fp-wall)" strokeWidth={W} strokeLinejoin="miter" />)}

            {/* Stair blocks */}
            {(stairs || []).map((s, i) => (
                <g key={i}>
                    <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="url(#hatch)" />
                    <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="none" stroke="var(--fp-wall)" strokeWidth={4} />
                    {Array.from({ length: Math.floor(s.h / 8) }).map((_, j) => (
                        <line key={j} x1={s.x} y1={s.y + j * 8} x2={s.x + s.w} y2={s.y + j * 8} stroke="var(--fp-hatch)" strokeWidth="0.7" />
                    ))}
                    <text x={s.x + s.w / 2} y={s.y + s.h / 2} textAnchor="middle" fontSize="6" fill="var(--fp-subtext)" fontFamily="Inter,sans-serif">STAIRS</text>
                </g>
            ))}

            {/* Structural columns */}
            {(cols || []).map(([cx, cy], i) => <rect key={i} x={cx - 5} y={cy - 5} width={10} height={10} fill="var(--fp-wall)" />)}

            {/* Windows */}
            {(windows || []).map((w, i) => <Win key={i} w={w} />)}

            {/* Doors */}
            {(doors || []).map((d, i) => <Door key={i} d={d} />)}

            {/* North arrow */}
            <g transform={`translate(${vw - 18},18)`}>
                <circle cx={0} cy={0} r={14} fill="var(--fp-bg)" stroke="var(--fp-wall)" strokeWidth={1} />
                <polygon points="0,-11 2.5,4 0,0 -2.5,4" fill="var(--fp-wall)" />
                <polygon points="0,11 2.5,-4 0,0 -2.5,-4" fill="var(--fp-grid)" />
                <text textAnchor="middle" y="-2" fontSize="5.5" fontWeight="800" fill="var(--fp-wall)" fontFamily="Inter">N</text>
            </g>

            {/* Title block */}
            <text x={outer.x} y={vw > 400 ? vh - 8 : vh - 6} fontSize="6.5" fontWeight="700" fill="var(--fp-text)" fontFamily="Inter">{plan.name} — {floor.label}</text>
            <text x={outer.x + 200} y={vw > 400 ? vh - 8 : vh - 6} fontSize="6" fill="var(--fp-subtext)" fontFamily="Inter">Scale: {plan.scale}  |  Area: {plan.area}</text>

            {/* Scale bar */}
            <g transform={`translate(${outer.x},${vh - 2})`}>
                <line x1={0} y1={0} x2={50} y2={0} stroke="var(--fp-wall)" strokeWidth={1.5} />
                <line x1={0} y1={-3} x2={0} y2={3} stroke="var(--fp-wall)" strokeWidth={1.5} />
                <line x1={50} y1={-3} x2={50} y2={3} stroke="var(--fp-wall)" strokeWidth={1.5} />
                <text x={25} y={-5} textAnchor="middle" fontSize="5" fill="var(--fp-subtext)" fontFamily="Inter">10m</text>
            </g>
        </svg>
    );
}

// ─── TRUE 3D WEBGL MAP ──────────────────────────────────────────

function darkenHex(hex, amt) {
    if (!hex.startsWith('#')) return hex;
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - amt * 2), g = Math.max(0, ((n >> 8) & 0xff) - amt * 2), b = Math.max(0, (n & 0xff) - amt * 2);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const GS = 2; // Real 3D Grid Size

function BuildingMesh({ b, isSel, isHov, onSelect, setHov }) {
    // Height adjustments
    const baseH = b.h / 15;
    const activeHOffset = isSel ? 0.8 : isHov ? 0.3 : 0;
    const H = baseH + activeHOffset;

    // Positioning
    const W = b.gw * GS;
    const D = b.gd * GS;
    // Map grid to 3D center coordinates (-X left, +X right, -Z forward, +Z back)
    const cx = (b.gx * GS) + (W / 2) - 15;
    const cy = H / 2;
    const cz = (b.gy * GS) + (D / 2) - 18;

    const roofC = isSel ? '#ffffff' : isHov ? b.color : darkenHex(b.color, 10);
    const wallC = darkenHex(b.color, 25);

    return (
        <group
            position={[cx, 0, cz]}
            onClick={(e) => { e.stopPropagation(); onSelect(b); }}
            onPointerOver={(e) => { e.stopPropagation(); setHov(b.id); }}
            onPointerOut={() => setHov(null)}
        >
            {b.isHex ? (
                // Amphitheater
                <mesh position={[0, cy, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[W / 2, W / 2, H, 8]} />
                    <meshStandardMaterial color={wallC} roughness={0.7} />
                    {isSel && <Edges scale={1.01} color="white" />}
                </mesh>
            ) : (
                // Standard Box Building
                <mesh position={[0, cy, 0]} castShadow receiveShadow>
                    <boxGeometry args={[W, H, D]} />
                    {/* Materials for Faces (Left, Right, Top, Bottom, Front, Back) */}
                    <meshStandardMaterial attach="material-0" color={wallC} roughness={0.8} />
                    <meshStandardMaterial attach="material-1" color={wallC} roughness={0.8} />
                    <meshStandardMaterial attach="material-2" color={roofC} roughness={0.4} />
                    <meshStandardMaterial attach="material-3" color={wallC} roughness={0.8} />
                    <meshStandardMaterial attach="material-4" color={wallC} roughness={0.8} />
                    <meshStandardMaterial attach="material-5" color={wallC} roughness={0.8} />
                    {isSel && <Edges scale={1.01} color="white" />}
                </mesh>
            )}

            {/* Label on Roof */}
            <Text
                position={[0, H + 0.2, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={isSel ? 1.4 : 1}
                color={isSel ? "#3b82f6" : "#4b5563"}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {b.icon} {isSel || isHov ? b.label : ''}
            </Text>
        </group>
    );
}

function Map3D({ buildings, selected, onSelect }) {
    const [hov, setHov] = useState(null);

    return (
        <div style={{ position: 'absolute', inset: 0, minHeight: '400px' }}>
            <Canvas
                shadows
                camera={{ position: [25, 45, 60], fov: 45 }}
                style={{ width: '100%', height: '100%', display: 'block' }}
            >
                {/* Sky blue background */}
                <color attach="background" args={['#dbeafe']} />
                <fog attach="fog" args={['#dbeafe', 60, 150]} />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <hemisphereLight skyColor="#bfdbfe" groundColor="#86efac" intensity={0.6} />
                <directionalLight
                    castShadow
                    position={[30, 50, -20]}
                    intensity={1.2}
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-left={-30}
                    shadow-camera-right={30}
                    shadow-camera-top={30}
                    shadow-camera-bottom={-30}
                />

                {/* Ground Plane */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow onClick={() => onSelect(null)}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#f0fdf4" />
                </mesh>

                {/* Grid Helper */}
                <gridHelper args={[100, 50, '#d1d5db', '#e5e7eb']} position={[0, 0, 0]} />

                {/* Shadows beneath buildings */}
                <ContactShadows resolution={1024} scale={60} blur={2} opacity={0.4} far={10} color="#000000" />

                {/* Render All Buildings */}
                {buildings.map(b => (
                    <BuildingMesh
                        key={b.id}
                        b={b}
                        isSel={selected?.id === b.id}
                        isHov={hov === b.id}
                        onSelect={onSelect}
                        setHov={setHov}
                    />
                ))}

                {/* Controls (360 Rotation, Zoom, Pan) */}
                <OrbitControls
                    makeDefault
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 2 - 0.1}
                    minDistance={10}
                    maxDistance={80}
                    target={selected ? [
                        (selected.gx * GS) + (selected.gw * GS / 2) - 15,
                        0,
                        (selected.gy * GS) + (selected.gd * GS / 2) - 18
                    ] : [20, 0, 20]}
                />
            </Canvas>

            {/* Overlay UI */}
            <div style={{
                position: 'absolute', bottom: '20px', left: '20px',
                background: 'rgba(255,255,255,0.9)', padding: '12px 16px', borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', pointerEvents: 'none'
            }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#111827' }}>SMART CAMPUS — 3D BLOCK VIEW</div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '4px' }}>Left Click + Drag to rotate 360°</div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>Right Click + Drag to pan • Scroll to zoom</div>
            </div>
        </div>
    );
}
// ─── 2D FLAT MAP ─────────────────────────────────────────────────
const FLAT = BUILDINGS.map(b => ({
    id: b.id,
    label: b.label.split(' ')[0], // short label
    icon: b.icon,
    x: b.gx * 28 + 20,
    y: b.gy * 28 + 20,
    w: b.gw * 28 - 4,
    h: b.gd * 28 - 4,
    color: b.color
}));

const FPATHS = [
    // Outer roads
    [[42, 406], [490, 406]], // Bottom road
    [[42, 42], [42, 406]],   // Left road
    // Inner connecting courtyards (just drawing simple paths connecting them)
    [[140, 98], [420, 98]], // Top row connecting
    [[140, 98], [140, 360]], // left column 
    [[420, 98], [420, 360]], // right column
    [[140, 220], [420, 220]], // central access
];

function Flat2D({ selected, onSelect, routeNodes }) {
    const routePts = (routeNodes || [])
        .map(id => NODES[id])
        .filter(Boolean)
        .map(n => `${n.x},${n.y}`)
        .join(' ');

    const startN = routeNodes?.length > 0 ? NODES[routeNodes[0]] : null;
    const endN = routeNodes?.length > 1 ? NODES[routeNodes[routeNodes.length - 1]] : null;

    return (
        <svg viewBox="0 0 600 450" className="campus-svg">
            <rect width="600" height="450" fill="var(--bg)" />
            {[...Array(10)].map((_, i) => <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} stroke="var(--border)" strokeWidth="1" />)}
            {[...Array(12)].map((_, i) => <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="450" stroke="var(--border)" strokeWidth="1" />)}
            {FPATHS.map((p, i) => <line key={i} x1={p[0][0]} y1={p[0][1]} x2={p[1][0]} y2={p[1][1]} stroke="var(--bg-4)" strokeWidth="8" strokeLinecap="round" />)}
            {FLAT.map(b => {
                const full = BUILDINGS.find(x => x.id === b.id);
                const s = selected?.id === b.id;
                const isRouteBuilding = routeNodes?.some(nId => NODES[nId]?.building === b.id);
                return <g key={b.id} onClick={() => full && onSelect(full)} style={{ cursor: 'pointer' }}>
                    <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8" fill={s ? b.color : isRouteBuilding ? `${b.color}40` : `${b.color}18`} stroke={b.color} strokeWidth={s ? 2.5 : isRouteBuilding ? 2 : 1.5} style={{ filter: s ? `drop-shadow(0 0 10px ${b.color}80)` : isRouteBuilding ? `drop-shadow(0 0 6px ${b.color}60)` : 'none', transition: 'all 0.2s' }} />
                    <text x={b.x + b.w / 2} y={b.y + b.h / 2 - 7} textAnchor="middle" fontSize="13" dominantBaseline="middle">{b.icon}</text>
                    <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 9} textAnchor="middle" fontSize="8" fill={s ? 'white' : 'var(--text-2)'} fontFamily="Inter,sans-serif" fontWeight="600">{b.label}</text>
                </g>;
            })}

            {routePts && (
                <>
                    <polyline points={routePts} fill="none" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
                    <polyline points={routePts} fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={routePts} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 8" className="route-anim-line" />
                </>
            )}

            {startN && <circle cx={startN.x} cy={startN.y} r="6" fill="#10B981" stroke="white" strokeWidth="2" />}
            {endN && <circle cx={endN.x} cy={endN.y} r="6" fill="#EF4444" stroke="white" strokeWidth="2" />}

            <g transform="translate(555,40)">
                <circle cx={0} cy={0} r={20} fill="var(--bg-2)" stroke="var(--border-strong)" strokeWidth="1" />
                <text textAnchor="middle" y="-6" fontSize="7" fill="var(--text)" fontFamily="Inter">N</text>
                <polygon points="0,-12 3,0 0,-2 -3,0" fill="#EF4444" />
                <polygon points="0,12 3,0 0,2 -3,0" fill="var(--text-3)" />
            </g>
        </svg>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function CampusMap() {
    const navigate = useNavigate();
    const [view, setView] = useState('3d');
    const [selected, setSelected] = useState(null);
    const [floor, setFloor] = useState(0);
    const [search, setSearch] = useState('');
    const [dbLoc, setDbLoc] = useState([]);

    const [navSteps, setNavSteps] = useState([]);
    const [navRouteNodes, setNavRouteNodes] = useState([]);
    const [isNavActive, setIsNavActive] = useState(false);

    useEffect(() => { 
        getLocations().then(r => setDbLoc(r.data.filter(l => !l.isHidden))).catch(e => console.error(e)); 
    }, []);

    const handleNavigateRequest = ({ fromId, fromLabel, toId, toLabel, toRoom, toFloor }) => {
        const startNode = getStartNodeForBuilding(fromId);
        const endNode = getDestNodeForBuilding(toId, toFloor);

        // Calculate path using Dijkstra
        const path = dijkstra(CAMPUS_GRAPH, startNode, endNode);

        if (path && path.length > 0) {
            const steps = generateNavSteps(path, fromId, fromLabel, toId, toLabel, toRoom, toFloor);
                    setNavSteps(steps);
            setNavRouteNodes(path);
            setIsNavActive(true);
            setView('2d'); // Switch to 2D view to show the route
        } else {
            alert('Could not find a valid route between these locations.');
        }
    };

    const pick = (b) => { setSelected(b); setFloor(0); logSearch(b.label).catch(e => console.error(e)); };
    const launchAR = () => navigate(selected ? `/ar-navigation?dest=${selected.id}&label=${encodeURIComponent(selected.label)}` : '/ar-navigation');
    const archPlan = selected ? (ARCH_PLANS[selected.id] || DFLT_PLAN) : DFLT_PLAN;
    const filtered = BUILDINGS.filter(b => !search || b.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="map-page page">
            <div className="map-page-header">
                <div className="container">
                    <h1>Campus Explorer</h1>
                    <p>Interactive 2D/3D map of SCET Campus.</p>
                </div>
            </div>
            <div className="map-layout">
                <aside className="map-sidebar">
                    <h2>Campus Map</h2>
                    <div className="map-view-toggle">
                        <button className={`view-btn ${view === 'fp' ? 'active' : ''}`} onClick={() => setView('fp')}>Plans</button>
                        <button className={`view-btn ${view === '3d' ? 'active' : ''}`} onClick={() => setView('3d')}>3D</button>
                        <button className={`view-btn ${view === '2d' ? 'active' : ''}`} onClick={() => setView('2d')}>2D</button>
                    </div>

                    <input className="map-search-input" placeholder="Search buildings…" value={search} onChange={e => setSearch(e.target.value)} />

                    {selected ? (
                        <div className="map-sel-card card card-p-sm" style={{ borderLeft: `3px solid ${selected.color}` }}>
                            <div className="flex-between">
                                <div className="flex gap-8" style={{ alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.4rem' }}>{selected.icon}</span>
                                    <div>
                                        <div className="font-semibold text-sm">{selected.label}</div>
                                        <div className="text-xs text-3">{selected.floors} floor{selected.floors > 1 ? 's' : ''} · {archPlan.area}</div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(null)}>✕</button>
                            </div>
                            <p className="text-xs text-2" style={{ marginTop: '4px' }}>{selected.desc}</p>
                            <div className="sel-actions">
                                <button className="btn btn-secondary btn-sm" onClick={() => setView('fp')}>Floor Plan</button>
                                <button className="btn btn-primary btn-sm" onClick={launchAR}>AR Nav</button>
                            </div>
                        </div>
                    ) : (
                        <div className="map-no-sel card card-p-sm text-center">
                            <div style={{ fontSize: '1.5rem' }}></div>
                            <p className="text-xs text-3">Click a building to explore its floor plan and AR navigate</p>
                        </div>
                    )}

                    {view === 'fp' && selected && archPlan.floors.length > 1 && (
                        <div className="fp-sidebar-floors">
                            <div className="loc-list-head">Floor</div>
                            {archPlan.floors.map((f, i) => (
                                <button key={i} className={`fp-sidebar-floor-btn ${floor === i ? 'active' : ''}`} onClick={() => setFloor(i)}>
                                    {i === 0 ? 'G' : i}F  ·  {f.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── New Modular Navigation ── */}
                    {selected && !isNavActive && (
                        <NavigationPanel
                            onNavigate={handleNavigateRequest}
                            onClose={() => setIsNavActive(false)}
                            isOpen={isNavActive}
                        />
                    )}

                    {isNavActive && (
                        <NavigationTimeline
                            steps={navSteps}
                            fromLabel={navSteps[0]?.title.replace('Start at ', '') || ''}
                            toLabel={navSteps[navSteps.length - 1]?.title.replace('Arrive at ', '').split(' in ')[1] || selected?.label || ''}
                            toRoom={navSteps[navSteps.length - 1]?.title.replace('Arrive at ', '') || ''}
                            archPlans={ARCH_PLANS}
                            onClose={() => {
                                setIsNavActive(false);
                                setNavRouteNodes([]);
                            }}
                            onExpandStep={(step) => {
                                setNavRouteNodes(step.routeNodes);
                            }}
                        />
                    )}

                    <div className="loc-list-head">Buildings ({filtered.length})</div>
                    <div className="loc-list">
                        {filtered.map(b => (
                            <div key={b.id} className={`loc-list-row ${selected?.id === b.id ? 'active' : ''}`} onClick={() => pick(b)}>
                                <span>{b.icon} {b.label}</span><span className="tag">{b.floors}F</span>
                            </div>
                        ))}
                    </div>

                    {dbLoc.length > 0 && <>
                        <div className="loc-list-head">Rooms ({dbLoc.length})</div>
                        <div className="loc-list">
                            {dbLoc.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6).map(l => (
                                <div key={l.id} className="loc-list-row"><span>{l.name}</span><span className="tag">{l.type}</span></div>
                            ))}
                        </div>
                    </>}
                </aside>

                <div className="map-container">
                    {view === 'fp' ? (
                        <div className="fp-full-view">
                            {!selected ? (
                                <div className="fp-no-sel">
                                    <div style={{ fontSize: '4rem' }}></div>
                                    <h2>Architectural Floor Plans</h2>
                                    <p>Select a building from the sidebar or click below</p>
                                    <div className="fp-building-grid">
                                        {BUILDINGS.filter(b => ARCH_PLANS[b.id]).map(b => (
                                            <button key={b.id} className="fp-building-tile card card-p" onClick={() => pick(b)}>
                                                <span style={{ fontSize: '2rem' }}>{b.icon}</span>
                                                <span className="font-semibold text-sm">{b.label}</span>
                                                <span className="text-xs text-3">{ARCH_PLANS[b.id].floors.length} floors · {ARCH_PLANS[b.id].area}</span>
                                                <span className="badge badge-brand" style={{ fontSize: '0.63rem' }}>Plans Available</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="fp-viewer">
                                    <div className="fp-viewer-header">
                                        <div className="fp-legend-items">
                                            <div className="fp-legend-item2"><span className="fp-swatch" style={{ background: 'var(--brand)', opacity: .15 }} /><span>Room</span></div>
                                            <div className="fp-legend-item2"><svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="var(--text)" strokeWidth="3.5" /></svg><span>Wall</span></div>
                                            <div className="fp-legend-item2"><svg width="22" height="8"><line x1="0" y1="2" x2="22" y2="2" stroke="#0EA5E9" strokeWidth="3.5" /><line x1="0" y1="6" x2="22" y2="6" stroke="#0EA5E9" strokeWidth="3.5" /></svg><span>Window</span></div>
                                            <div className="fp-legend-item2"><svg width="22" height="14"><line x1="0" y1="0" x2="12" y2="0" stroke="var(--text)" strokeWidth="1.5" /><path d="M0,0 A12,12 0 0,1 12,12" fill="none" stroke="var(--text)" strokeWidth="0.9" strokeDasharray="2,1" /></svg><span>Door</span></div>
                                            <div className="fp-legend-item2"><svg width="16" height="12"><rect width="16" height="12" fill="none" stroke="var(--text)" strokeWidth="1" /><line x1="0" y1="12" x2="16" y2="0" stroke="var(--text)" strokeWidth="1" /><line x1="0" y1="8" x2="8" y2="0" stroke="var(--text)" strokeWidth="0.8" /></svg><span>Stairs</span></div>
                                            <div className="fp-legend-item2"><svg width="12" height="12"><rect x="1" y="1" width="10" height="10" fill="var(--text)" /></svg><span>Column</span></div>
                                        </div>
                                        <button className="btn btn-primary btn-sm" onClick={launchAR}>AR Navigate to {selected.label}</button>
                                    </div>
                                    <div className="fp-scroll-wrap">
                                        <FloorPlanSVG plan={archPlan} fi={floor} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : view === '3d' ? (
                        <Map3D buildings={filtered} selected={selected} onSelect={b => { pick(b); }} />
                    ) : (
                        <Flat2D selected={selected} onSelect={pick} routeNodes={navRouteNodes} />
                    )}
                </div>
            </div>
        </div>
    );
}
