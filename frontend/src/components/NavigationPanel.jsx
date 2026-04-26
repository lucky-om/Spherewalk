/* Coded by Lucky */
/* SphereWalk Campus Explorer | v1.0 | Green Node Team */
import React, { useState, useEffect } from 'react';
import { BUILDING_FLOORS, getRoomsForFloor } from '../pages/navigationGraph';
import './NavigationPanel.css';

const BUILDINGS_LIST = [
    { id: 'block_a', label: 'Block A (Admin)' },
    { id: 'block_b', label: 'Block B (Arch)' },
    { id: 'block_c', label: 'Block C (CS)' },
    { id: 'block_d', label: 'Block D (Library)' },
    { id: 'block_e', label: 'Block E (Elec)' },
    { id: 'block_f', label: 'Block F (E&C)' },
    { id: 'block_g', label: 'Block G (IC)' },
    { id: 'block_h', label: 'Block H (IT)' },
    { id: 'block_ij', label: 'Block IJ (Chem)' },
    { id: 'block_k', label: 'Block K (Science)' },
    { id: 'block_l', label: 'Block L (Textile)' },
    { id: 'tifac', label: 'TIFAC Core' },
];

const FLOOR_LABELS = ['GF', '1F', '2F', '3F'];

export default function NavigationPanel({ onNavigate, onClose, isOpen }) {
    const [fromId, setFromId] = useState('block_a');
    const [toId, setToId] = useState('block_c');
    const [toFloor, setToFloor] = useState(0);
    const [toRoom, setToRoom] = useState('');

    // How many floors the destination building has
    const totalFloors = BUILDING_FLOORS[toId] || 1;

    // Rooms available on the selected floor for the destination building
    const rooms = getRoomsForFloor(toId, toFloor);

    // When destination building changes → reset floor to GF if it's out of range
    useEffect(() => {
        const maxFloor = (BUILDING_FLOORS[toId] || 1) - 1;
        if (toFloor > maxFloor) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setToFloor(0);
        }
    }, [toId, toFloor]);

    // When floor changes or rooms list changes → pick first room
    useEffect(() => {
        const floorRooms = getRoomsForFloor(toId, toFloor);
        if (floorRooms.length > 0 && !floorRooms.includes(toRoom)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setToRoom(floorRooms[0]);
        }
    }, [toFloor, toId, toRoom]);

    const handleSubmit = () => {
        const fromLabel = BUILDINGS_LIST.find(b => b.id === fromId)?.label || fromId;
        const toLabel = BUILDINGS_LIST.find(b => b.id === toId)?.label || toId;
        onNavigate({ fromId, fromLabel, toId, toLabel, toRoom, toFloor });
    };

    if (isOpen) return null;

    return (
        <div className="nav-panel card card-p-sm">
            <div className="nav-panel-header">
                <span className="nav-panel-title">✨ Get Directions</span>
                <button className="btn btn-ghost btn-xs" onClick={onClose}>✕</button>
            </div>

            {/* FROM building */}
            <div className="nav-field">
                <label>From:</label>
                <select value={fromId} onChange={e => setFromId(e.target.value)}>
                    {BUILDINGS_LIST.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
            </div>

            {/* TO building */}
            <div className="nav-field">
                <label>To Building:</label>
                <select value={toId} onChange={e => { setToId(e.target.value); setToFloor(0); }}>
                    {BUILDINGS_LIST.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
            </div>

            {/* FLOOR — only show floors this building actually has */}
            <div className="nav-field">
                <label>Floor: <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '0.7rem' }}>({totalFloors} floor{totalFloors > 1 ? 's' : ''})</span></label>
                <div className="floor-pills">
                    {Array.from({ length: totalFloors }, (_, f) => (
                        <button
                            key={f}
                            className={`floor-pill ${toFloor === f ? 'active' : ''}`}
                            onClick={() => setToFloor(f)}
                        >
                            {FLOOR_LABELS[f] || `${f}F`}
                        </button>
                    ))}
                </div>
            </div>

            {/* ROOM — only rooms on the selected floor */}
            <div className="nav-field">
                <label>To Room:</label>
                <select value={toRoom} onChange={e => setToRoom(e.target.value)}>
                    {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div className="nav-actions">
                <button className="btn btn-primary btn-sm nav-go-btn" onClick={handleSubmit}>
                    🚀 Get Route
                </button>
            </div>
        </div>
    );
}
