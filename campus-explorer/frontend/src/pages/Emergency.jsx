import React, { useState } from 'react';
import './Emergency.css';

const QUICK_CALLS = [
    { label: 'Campus Security', num: '9876500001', icon: '🔒', c: '#EF4444' },
    { label: 'Medical Room', num: '9876500002', icon: '🏥', c: '#F59E0B' },
    { label: 'Ambulance', num: '108', icon: '🚑', c: '#10B981' },
    { label: 'Flashlight', num: null, icon: '🔦', c: '#FBBF24' },
];
const CONTACTS = [
    { role: 'Security', phone: '9876500001', icon: '🔒', c: '#EF4444' },
    { role: 'Medical', phone: '9876500002', icon: '🏥', c: '#F59E0B' },
    { role: 'Principal', phone: '9876543210', icon: '👔', c: '#5B4FE9' },
    { role: 'Fire', phone: '101', icon: '🚒', c: '#FF6B35' },
    { role: 'Ambulance', phone: '108', icon: '🚑', c: '#10B981' },
    { role: 'Police', phone: '100', icon: '👮', c: '#0EA5E9' },
];
const EXITS = [
    { dir: '↓', label: 'Main Gate', dist: '~200m' },
    { dir: '→', label: 'Side Exit (CS Block)', dist: '~80m' },
    { dir: '↑', label: 'Back Gate', dist: '~150m' },
];
const TIPS = [
    'Stay calm and assess the situation carefully.',
    'Use nearest exit — do NOT use elevators during a fire.',
    'Assemble at the parking area during evacuation.',
    'Do not re-enter the building until cleared by security.',
];

export default function Emergency() {
    const [flashOn, setFlashOn] = useState(false);
    const [track, setTrack] = useState(null);

    const call = (num) => { if (num) window.location.href = `tel:${num}`; };
    const toggleFlash = async () => {
    try {
        if (!track) {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: "environment" } }
            });

            const videoTrack = stream.getVideoTracks()[0];
            setTrack(videoTrack);

            await videoTrack.applyConstraints({
                advanced: [{ torch: true }]
            });

            setFlashOn(true);
        } else {
            await track.applyConstraints({
                advanced: [{ torch: false }]
            });

            track.stop();
            setTrack(null);
            setFlashOn(false);
        }
    } catch (err) {
        console.error(err);
        alert("Flashlight is not supported on this device or browser.");
    }
};

    return (
        <div className="emergency-page page">
            <div className="emergency-wrap">
                <div className="emrg-header">
                    <div className="emrg-icon">🚨</div>
                    <h1>Emergency Mode</h1>
                    <p>Stay calm. Help is available. Tap to call.</p>
                </div>

                <div className="quick-calls">
                    {QUICK_CALLS.map((q, i) => (
                        <button key={i} className="q-call-btn" style={{ '--btn-c': q.c }} onClick={() => q.num ? call(q.num) : toggleFlash()}>
                            <span className="q-call-icon">{q.icon}</span>
                            <div>
                                <div className="q-call-label">{q.label}</div>
                                <div className="q-call-num">{q.num || (flashOn ? 'ON' : 'OFF')}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="emrg-grid">
                    <div className="emrg-card card">
                        <h2>🚪 Nearest Exits</h2>
                        <svg viewBox="0 0 240 150" className="mini-map-svg">
                            <rect width="240" height="150" fill="var(--bg-2)" rx="8" />
                            {[...Array(5)].map((_, i) => <line key={`h${i}`} x1="0" y1={i * 30} x2="240" y2={i * 30} stroke="var(--border)" strokeWidth=".5" />)}
                            {[...Array(8)].map((_, i) => <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="150" stroke="var(--border)" strokeWidth=".5" />)}
                            <rect x="90" y="50" width="60" height="50" fill="var(--brand-light)" stroke="var(--brand)" strokeWidth="1.5" rx="4" />
                            <text x="120" y="77" textAnchor="middle" fontSize="8" fill="var(--brand)" fontFamily="Inter" fontWeight="600">YOU ARE HERE</text>
                            {/* Exit arrows */}
                            <g fill="#10B981">
                                <polygon points="120,140 115,128 125,128" />
                                <line x1="120" y1="100" x2="120" y2="132" stroke="#10B981" strokeWidth="1.5" />
                                <polygon points="228,75 216,70 216,80" />
                                <line x1="150" y1="75" x2="220" y2="75" stroke="#10B981" strokeWidth="1.5" />
                                <polygon points="120,10 115,22 125,22" />
                                <line x1="120" y1="50" x2="120" y2="18" stroke="#10B981" strokeWidth="1.5" />
                            </g>
                            <circle cx="120" cy="75" r="5" fill="#EF4444" />
                            <circle cx="120" cy="75" r="10" fill="none" stroke="#EF4444" strokeWidth="1" opacity="0.4" />
                            <text x="104" y="148" fontSize="6" fill="#10B981" fontFamily="Inter">Main Gate</text>
                            <text x="168" y="70" fontSize="6" fill="#10B981" fontFamily="Inter">Side Exit</text>
                            <text x="104" y="8" fontSize="6" fill="#10B981" fontFamily="Inter">Back Gate</text>
                        </svg>
                        <div className="exits-list">
                            {EXITS.map((e, i) => (
                                <div key={i} className="exit-row">
                                    <div className="exit-dir">{e.dir}</div>
                                    <div><div className="exit-name">{e.label}</div><div className="exit-dist text-xs text-3">{e.dist}</div></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="emrg-card card">
                        <h2>📞 Emergency Contacts</h2>
                        <div className="contacts-grid">
                            {CONTACTS.map((c, i) => (
                                <button key={i} className="contact-tile" style={{ '--tile-c': c.c }} onClick={() => call(c.phone)}>
                                    <span className="contact-tile-icon">{c.icon}</span>
                                    <div className="contact-tile-role">{c.role}</div>
                                    <div className="contact-tile-num">{c.phone}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="safety-card card">
                    <h3>⚠️ Safety Reminders</h3>
                    <div className="safety-tips-list">
                        {TIPS.map((t, i) => <div key={i} className="safety-item"><span className="safety-check">⚠</span>{t}</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
