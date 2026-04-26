/* Coded by Lucky */
/* SphereWalk Campus Explorer | v1.0 | Green Node Team */
import React from 'react';
import { Link } from 'react-router-dom';
import './Error404.css';

export default function Error404() {
    return (
        <div className="error-page page">
            {/* Background Orbs */}
            <div className="error-bg">
                <div className="error-orb error-orb-1"></div>
                <div className="error-orb error-orb-2"></div>
            </div>

            <div className="error-content">
                <h1 className="error-code">404</h1>
                <h2 className="error-title">You've Strayed Off Campus</h2>
                <p className="error-desc">
                    The location you're looking for doesn't seem to exist or has been moved. 
                    Let's get you back to familiar grounds.
                </p>
                <div className="error-actions">
                    <Link to="/" className="btn btn-primary btn-lg">Return to Base</Link>
                    <Link to="/campus-map" className="btn btn-secondary btn-lg">View Campus Map</Link>
                </div>
            </div>
        </div>
    );
}
