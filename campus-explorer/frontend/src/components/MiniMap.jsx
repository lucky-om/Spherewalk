import React, { useMemo } from 'react';
import { NODES } from '../pages/navigationGraph';
import './MiniMap.css';

// ── Campus 2D building layout (matches Flat2DWithRoute) ──────────────────────
const FLAT = [
    { id: 'block_a', x: 60, y: 50, w: 90, h: 70, color: '#94a3b8', label: 'Block A' },
    { id: 'block_b', x: 170, y: 50, w: 80, h: 70, color: '#bbf7d0', label: 'Block B' },
    { id: 'block_c', x: 270, y: 50, w: 90, h: 70, color: '#fecdd3', label: 'Block C' },
    { id: 'block_d', x: 380, y: 50, w: 70, h: 70, color: '#e9d5ff', label: 'Block D' },
    { id: 'block_e', x: 470, y: 50, w: 80, h: 70, color: '#fef08a', label: 'Block E' },
    { id: 'block_f', x: 470, y: 140, w: 80, h: 80, color: '#ffedd5', label: 'Block F' },
    { id: 'block_g', x: 470, y: 240, w: 80, h: 70, color: '#fbcfe8', label: 'Block G' },
    { id: 'block_h', x: 470, y: 330, w: 80, h: 80, color: '#a7f3d0', label: 'Block H' },
    { id: 'block_ij', x: 370, y: 340, w: 80, h: 70, color: '#dcfce7', label: 'Block IJ' },
    { id: 'block_k', x: 270, y: 340, w: 80, h: 70, color: '#bbf7d0', label: 'Block K' },
    { id: 'block_l', x: 160, y: 340, w: 90, h: 70, color: '#fecdd3', label: 'Block L' },
    { id: 'tifac', x: 60, y: 340, w: 80, h: 70, color: '#e2e8f0', label: 'TIFAC' },
    { id: 'center_stage', x: 230, y: 180, w: 140, h: 100, color: '#f8fafc', label: 'Amphitheater' },
];

const FPATHS = [
    [[110, 140], [450, 140]],
    [[450, 140], [450, 320]],
    [[450, 320], [110, 320]],
    [[110, 320], [110, 140]],
    [[300, 140], [300, 180]],
    [[300, 320], [300, 280]],
    [[450, 230], [370, 230]],
];

const PAD = 40;

// ── Find a room center by fuzzy matching its label ────────────────────────────
function findRoomByLabel(rooms, targetLabel) {
    if (!rooms || !targetLabel) return null;
    const target = targetLabel.toLowerCase().trim();

    // Exact match first
    let found = rooms.find(r => r.label?.toLowerCase() === target);
    if (found) return found;

    // Partial match — target contains room label words
    found = rooms.find(r => {
        const label = r.label?.toLowerCase() || '';
        const words = label.split(/[\s/&]+/).filter(w => w.length > 3);
        return words.some(w => target.includes(w));
    });
    if (found) return found;

    // Reverse partial — room label appears inside target
    found = rooms.find(r => {
        const label = r.label?.toLowerCase() || '';
        return label.length > 4 && target.includes(label);
    });
    return found || null;
}

function roomCenter(r) {
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

// ── Build a floor-plan route path dynamically ─────────────────────────────────
// Returns array of { x, y } points to draw the blue line through
function buildFloorPlanPath(step, plan, floorIdx) {
    if (!plan) return [];
    const floor = plan.floors[floorIdx] || plan.floors[0];
    if (!floor?.rooms?.length) return [];

    const rooms = floor.rooms;
    const pts = [];

    // ── 1. Entry/Start point ─────────────────────────────────────────────────
    // Prefer reception/lobby/HOD, else first room
    const entryRoom =
        findRoomByLabel(rooms, 'reception') ||
        findRoomByLabel(rooms, 'lobby') ||
        findRoomByLabel(rooms, 'entry') ||
        rooms[0];
    if (entryRoom) pts.push({ ...roomCenter(entryRoom), role: 'start' });

    // ── 2. Corridor mid-point (if corridor exists) ────────────────────────────
    if (floor.corridors?.length > 0) {
        const c = floor.corridors[0];
        pts.push({ x: c.x + c.w / 2, y: c.y + c.h / 2, role: 'corridor' });
    }

    // ── 3. Destination point (step-type aware) ────────────────────────────────
    let destRoom = null;

    if (step.type === 'destination') {
        // Try to match the actual room name stored on step
        const targetName = step.toRoom || step.title?.replace(/^Arrive at /i, '');
        if (targetName) {
            destRoom = findRoomByLabel(rooms, targetName);
        }
        // Fallback: last non-utility room
        if (!destRoom || destRoom === entryRoom) {
            destRoom = [...rooms].reverse().find(r =>
                !/stair|wash|lift|reception|lobby|utility|print/i.test(r.label) &&
                r !== entryRoom
            ) || rooms[rooms.length - 1];
        }

    } else if (step.type === 'stairs' || step.type === 'floor_change') {
        // Head toward the stairs/lift room
        destRoom =
            rooms.find(r => /stair|lift/i.test(r.label)) ||
            rooms[rooms.length - 1];

    } else if (step.type === 'enter' || step.type === 'start') {
        // Just show first couple of rooms (no deep destination)
        destRoom = rooms.find(r =>
            !/stair|wash|lift|reception|lobby/i.test(r.label) && r !== entryRoom
        ) || rooms[1] || rooms[0];

    } else {
        // exit or other — show entry → corridor only, no extra room
        destRoom = null;
    }

    if (destRoom && destRoom !== entryRoom) {
        pts.push({ ...roomCenter(destRoom), role: 'end' });
    }

    return pts;
}

// ── Campus-level viewbox calculation ─────────────────────────────────────────
function getViewBox(step, isFloorPlan, plan, fi) {
    if (isFloorPlan && plan?.floors[fi]) return { vx: 0, vy: 0, vw: 460, vh: 310 };

    const nodeIds = [...(step.routeNodes || []), step.fromNode, step.toNode].filter(Boolean);
    const highlightBuildings = step.highlightBuildings || [];
    let xs = [], ys = [];

    nodeIds.forEach(nId => { const n = NODES[nId]; if (n) { xs.push(n.x); ys.push(n.y); } });
    highlightBuildings.forEach(bId => {
        const b = FLAT.find(f => f.id === bId);
        if (b) { xs.push(b.x, b.x + b.w); ys.push(b.y, b.y + b.h); }
    });

    if (xs.length === 0) return { vx: 0, vy: 0, vw: 600, vh: 450 };
    return {
        vx: Math.max(0, Math.min(...xs) - PAD),
        vy: Math.max(0, Math.min(...ys) - PAD),
        vw: Math.min(600, Math.max(...xs) + PAD) - Math.max(0, Math.min(...xs) - PAD),
        vh: Math.min(450, Math.max(...ys) + PAD) - Math.max(0, Math.min(...ys) - PAD),
    };
}

// ── Campus route polyline ─────────────────────────────────────────────────────
function CampusRoutePolyline({ step }) {
    const nodeIds = step.routeNodes || [];
    if (nodeIds.length < 2) {
        const n = NODES[nodeIds[0]];
        if (!n) return null;
        return <circle cx={n.x} cy={n.y} r="6" fill="#3b82f6" opacity="0.8" />;
    }
    const points = nodeIds.map(id => NODES[id]).filter(Boolean).map(n => `${n.x},${n.y}`).join(' ');
    if (!points) return null;
    return (
        <>
            <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
            <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={points} fill="none" stroke="rgba(147,210,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="minimap-route-anim" />
        </>
    );
}

// ── Floor-plan route path overlay ─────────────────────────────────────────────
function FloorPlanRoutePath({ step, plan, floorIdx }) {
    const pts = buildFloorPlanPath(step, plan, floorIdx);
    if (pts.length === 0) return null;

    const startPt = pts[0];
    const endPt = pts[pts.length - 1];
    const pointsStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    return (
        <>
            {pts.length >= 2 && <>
                {/* Glow halo */}
                <polyline points={pointsStr} fill="none" stroke="#0EA5E9" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
                {/* Main blue line */}
                <polyline points={pointsStr} fill="none" stroke="#0EA5E9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
                {/* Animated white dashes */}
                <polyline points={pointsStr} fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 10" opacity="0.75" className="minimap-route-anim" />
            </>}

            {/* Start dot — green */}
            <circle cx={startPt.x} cy={startPt.y} r="7" fill="#22C55E" opacity="0.2" />
            <circle cx={startPt.x} cy={startPt.y} r="4" fill="#22C55E" stroke="white" strokeWidth="1.5" />
            <text x={startPt.x + 7} y={startPt.y + 3} fontSize="5" fill="#22C55E" fontWeight="700" fontFamily="Inter">START</text>

            {/* End dot — red (only if path has > 1 point) */}
            {pts.length >= 2 && <>
                <circle cx={endPt.x} cy={endPt.y} r="7" fill="#EF4444" opacity="0.2" />
                <circle cx={endPt.x} cy={endPt.y} r="4" fill="#EF4444" stroke="white" strokeWidth="1.5" />
                <text x={endPt.x + 7} y={endPt.y + 3} fontSize="5" fill="#EF4444" fontWeight="700" fontFamily="Inter">
                    {step.type === 'destination' ? 'DEST' : 'NEXT'}
                </text>
            </>}
        </>
    );
}

// ── Main MiniMap component ────────────────────────────────────────────────────
export default function MiniMap({ step, isActive, onExpand, plan, fi }) {
    const floorIdx = fi ?? step.floor ?? 0;
    const isFloorPlan = !!(plan?.floors && step.building && step.building !== 'campus');

    const { vx, vy, vw, vh } = useMemo(
        () => getViewBox(step, isFloorPlan, plan, floorIdx),
        [step, isFloorPlan, plan, floorIdx]
    );

    let finalViewBox = `${vx} ${vy} ${vw} ${vh}`;
    if (isFloorPlan) {
        const floor = plan.floors[floorIdx] || plan.floors[0];
        if (floor?.vw) finalViewBox = floor.vw;
    }

    const fromN = NODES[step.fromNode];
    const toN = step.fromNode !== step.toNode ? NODES[step.toNode] : null;

    // ═══════════════ FLOOR-PLAN MINIMAP ═══════════════════════════════════════
    if (isFloorPlan) {
        const floor = plan.floors[floorIdx] || plan.floors[0];
        const { W = 7, rooms = [], corridors = [], outer, stairs = [], cols = [], doors = [], windows = [] } = floor;

        return (
            <div className={`minimap-wrap ${isActive ? 'minimap-active' : ''}`} onClick={onExpand}>
                <div className="minimap-floor-badge">
                    {floorIdx === 0 ? 'GF' : `${floorIdx}F`} · {floor.label}
                </div>
                <svg viewBox={finalViewBox} className="minimap-svg fp-mini" xmlns="http://www.w3.org/2000/svg">
                    {/* Background */}
                    <rect width="2000" height="2000" fill="#090e1a" x="-500" y="-500" />

                    {/* Grid */}
                    <pattern id={`fp-mini-grid-${step.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M10,0L0,0 0,10" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.3" />
                    </pattern>
                    <rect width="2000" height="2000" fill={`url(#fp-mini-grid-${step.id})`} x="-500" y="-500" />

                    {/* Corridors */}
                    {corridors.map((c, i) => (
                        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill="rgba(20,30,50,0.9)" />
                    ))}

                    {/* Room fills + labels */}
                    {rooms.map(r => (
                        <g key={r.id}>
                            <rect x={r.x + W / 2} y={r.y + W / 2} width={r.w - W} height={r.h - W} fill={`${r.color}1A`} />
                            <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 6} textAnchor="middle" fontSize="12" dominantBaseline="middle">{r.icon}</text>
                            <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 9} textAnchor="middle" fontSize="5.5" fill="rgba(200,220,255,0.55)" fontFamily="Inter,sans-serif" fontWeight="600">{r.label}</text>
                        </g>
                    ))}

                    {/* Outer wall */}
                    {outer && (
                        <rect x={outer.x} y={outer.y} width={outer.w} height={outer.h} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={W + 1} />
                    )}

                    {/* Interior room walls */}
                    {rooms.map(r => (
                        <rect key={`w-${r.id}`} x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={W} />
                    ))}

                    {/* Stairs */}
                    {stairs.map((s, i) => (
                        <g key={i}>
                            <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.22)" strokeWidth="3" />
                            <text x={s.x + s.w / 2} y={s.y + s.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize="5" fill="rgba(255,255,255,0.38)" fontFamily="Inter,sans-serif">STAIRS</text>
                        </g>
                    ))}

                    {/* Structural columns */}
                    {cols.map(([cx, cy], i) => (
                        <rect key={i} x={cx - 4} y={cy - 4} width={8} height={8} fill="rgba(255,255,255,0.35)" />
                    ))}

                    {/* ── DYNAMIC BLUE ROUTE PATH ── */}
                    <FloorPlanRoutePath step={step} plan={plan} floorIdx={floorIdx} />
                </svg>
                <div className="minimap-expand-hint"><span>⛶ Expand</span></div>
            </div>
        );
    }

    // ═══════════════ CAMPUS / OUTDOOR MINIMAP ═════════════════════════════════
    return (
        <div className={`minimap-wrap ${isActive ? 'minimap-active' : ''}`} onClick={onExpand} title="Click to open full map">
            <svg viewBox={finalViewBox} className="minimap-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                <rect x={vx} y={vy} width={vw} height={vh} fill="var(--minimap-bg, #0e0e18)" />
                {Array.from({ length: Math.ceil(vh / 25) + 1 }).map((_, i) => (
                    <line key={`gh${i}`} x1={vx} y1={vy + i * 25} x2={vx + vw} y2={vy + i * 25} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                ))}
                {Array.from({ length: Math.ceil(vw / 25) + 1 }).map((_, i) => (
                    <line key={`gv${i}`} x1={vx + i * 25} y1={vy} x2={vx + i * 25} y2={vy + vh} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                ))}
                {FPATHS.map((p, i) => (
                    <line key={i} x1={p[0][0]} y1={p[0][1]} x2={p[1][0]} y2={p[1][1]} stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" />
                ))}
                {FLAT.map(b => {
                    const isHighlighted = step.highlightBuildings?.includes(b.id);
                    return (
                        <g key={b.id}>
                            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="5"
                                fill={isHighlighted ? `${b.color}28` : 'rgba(255,255,255,0.03)'}
                                stroke={isHighlighted ? b.color : 'rgba(255,255,255,0.1)'}
                                strokeWidth={isHighlighted ? 2 : 0.8}
                            />
                            {isHighlighted && (
                                <>
                                    <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="5" fill="none" stroke={b.color} strokeWidth="4" opacity="0.2" />
                                    <text x={b.x + b.w / 2} y={b.y + b.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill={b.color} fontFamily="Inter, sans-serif"
                                        style={{ filter: `drop-shadow(0 0 3px ${b.color})` }}>
                                        {b.label}
                                    </text>
                                </>
                            )}
                        </g>
                    );
                })}

                {/* Animated campus route */}
                <CampusRoutePolyline step={step} />

                {fromN && (
                    <g>
                        <circle cx={fromN.x} cy={fromN.y} r="10" fill="#10b981" opacity="0.2" />
                        <circle cx={fromN.x} cy={fromN.y} r="5" fill="#10b981" stroke="white" strokeWidth="1.5" />
                    </g>
                )}
                {toN && (
                    <g>
                        <circle cx={toN.x} cy={toN.y} r="10" fill="#3b82f6" opacity="0.2" />
                        <circle cx={toN.x} cy={toN.y} r="5" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
                    </g>
                )}
                {step.type === 'destination' && fromN && (
                    <text x={fromN.x} y={fromN.y - 12} textAnchor="middle" fontSize="14">🎯</text>
                )}
            </svg>
            <div className="minimap-expand-hint"><span>⛶</span></div>
        </div>
    );
}
