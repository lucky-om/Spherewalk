import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VisitorTour.css';

const STOPS = [
    { id: 1, icon: '', title: 'Welcome to Campus', desc: 'Welcome to one of Maharashtra\'s premier engineering colleges. Established 1994, our 25-acre campus serves over 2,800 students with state-of-the-art facilities.', facts: ['NAAC A+ Accredited', '25-acre campus', '4 Engineering Branches'], action: null },
    { id: 2, icon: '', title: 'Main Block & Admin Office', desc: 'The Main Block houses the Principal\'s Office, Administration, Admissions Cell, and Dean\'s offices. Colonial-style architecture with modern facilities.', facts: ['Principal: Dr. Rajesh Sharma', 'Admissions: June–July', 'Contact: 9876543219'], action: '/campus-map' },
    { id: 3, icon: '', title: 'Computer Science Dept.', desc: 'Our CS & IT labs are equipped with the latest hardware including an AI/ML lab, Networking lab, and Cybersecurity lab — all with GPU workstations.', facts: ['6 specialized labs', 'HOD: Prof. Meena Patel', 'NBA Accredited'], action: '/virtual-tour' },
    { id: 4, icon: '', title: 'Central Library', desc: 'The Central Library has 50,000+ books, 200+ journals, and a digital resource room with IEEE, Elsevier, and Springer database access.', facts: ['50,000+ Books', 'Open 8AM–8PM', 'Digital Resource Section'], action: '/virtual-tour' },
    { id: 5, icon: '', title: 'Auditorium & Seminar Halls', desc: 'Our 500-seat auditorium hosts TechFest, placement drives, guest lectures, and cultural events with modern AV systems.', facts: ['Capacity: 500+', 'TechFest annually', 'Smart AV systems'], action: '/campus-map' },
    { id: 6, icon: '', title: 'Canteen & Student Spaces', desc: 'Multi-cuisine food court, indoor & outdoor seating, sports complex, and dedicated student hangout areas for a balanced campus life.', facts: ['Open 8AM–8PM', 'Multi-cuisine stalls', 'Indoor & outdoor seating'], action: null },
    { id: 7, icon: '', title: 'Training & Placement Cell', desc: 'Our T&P cell placed 342 students in 2024–25, with an average package of ₹7.2 LPA and a highest of ₹28 LPA at Google.', facts: ['342 placed (2024–25)', 'Avg: ₹7.2 LPA', 'Highest: ₹28 LPA (Google)'], action: '/ai-assistant' },
    { id: 8, icon: '', title: 'Start Exploring!', desc: 'Tour complete! Now navigate with AR, chat with the AI Copilot, explore 360° panoramas, or check campus events.', facts: [], action: '/ar-navigation' },
];

export default function VisitorTour() {
    const [cur, setCur] = useState(0);
    const nav = useNavigate();
    const stop = STOPS[cur];
    const pct = ((cur + 1) / STOPS.length) * 100;

    return (
        <div className="visitor-page page">
            <div className="visitor-wrap">
                <div className="tour-progress-wrap">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                    <div className="progress-label">Stop {cur + 1} of {STOPS.length}</div>
                </div>

                <div className="visitor-stop card" key={stop.id}>
                    <div className="stop-icon">{stop.icon}</div>
                    <h1 className="stop-title">{stop.title}</h1>
                    <p className="stop-desc">{stop.desc}</p>
                    {stop.facts.length > 0 && (
                        <div className="stop-facts">
                            {stop.facts.map((f, i) => <div key={i} className="stop-fact"><span className="fact-check">✓</span>{f}</div>)}
                        </div>
                    )}
                    {stop.action && (
                        <button className="btn btn-primary" onClick={() => nav(stop.action)}>
                            {cur === STOPS.length - 1 ? 'Start AR Navigation' : 'Explore This Space'}
                        </button>
                    )}
                </div>

                <div className="stop-nav">
                    {STOPS.map((s, i) => (
                        <button key={s.id} className={`stop-dot-btn ${i === cur ? 'active' : ''} ${i < cur ? 'done' : ''}`} onClick={() => setCur(i)}>
                            {i < cur ? '✓' : s.icon}
                        </button>
                    ))}
                </div>

                <div className="visitor-controls">
                    <button className="btn btn-secondary btn-lg" onClick={() => setCur(c => Math.max(0, c - 1))} disabled={cur === 0}>← Previous</button>
                    {cur < STOPS.length - 1
                        ? <button className="btn btn-primary btn-lg" onClick={() => setCur(c => Math.min(STOPS.length - 1, c + 1))}>Next Stop →</button>
                        : <button className="btn btn-accent btn-lg" onClick={() => nav('/')}>Back to Home</button>
                    }
                </div>
            </div>
        </div>
    );
}
