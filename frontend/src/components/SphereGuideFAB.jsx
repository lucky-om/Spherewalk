/* Coded by Lucky */
/* SphereWalk Campus Explorer | v1.0 | Green Node Team */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SphereGuideFAB.css';

export default function SphereGuideFAB() {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide FAB if already on the AI Assistant page
    if (location.pathname === '/ai-assistant') return null;

    return (
        <button
            className="sphere-guide-fab"
            onClick={() => navigate('/ai-assistant')}
            title="Talk to Sphere Guide"
        >
            <div className="fab-glow" />
            <div className="fab-content">
                <span className="fab-icon"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg></span>
                <span className="fab-text">Sphere Guide</span>
            </div>
            <div className="fab-pulse" />
        </button>
    );
}
