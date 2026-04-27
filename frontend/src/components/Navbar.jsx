/* Coded by Lucky */
/* SphereWalk Campus Explorer | v1.0 | Green Node Team */
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import './Navbar.css';

const navLinks = [
    { path: '/ar-navigation', label: 'AR Nav', icon: '' },
    { path: '/virtual-tour', label: '360° Tour', icon: '' },
    { path: '/campus-map', label: 'Map', icon: '' },
    { path: '/emergency', label: 'Emergency', icon: '' },
];

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, logout } = useStore();
    const [menuOpen, setMenuOpen] = useState(false);

    // Theme state
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('campus_theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('campus_theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    // Close menu when route changes
    useEffect(() => {
        setMenuOpen(false);
        // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [location.pathname]);

    return (
        <>
            <div className="navbar-wrapper">
                <nav className="navbar-inner">
                {/* Brand */}
                <Link to="/" className="navbar-brand">
                    <img src="/logo.png" alt="SphereWalk Logo" className="navbar-logo-img" />
                    <span className="brand-name">
                        <span className="brand-sphere">Sphere</span><span className="brand-walk">Walk</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="navbar-links">
                    {navLinks.map((l, i) => (
                        <Link
                            key={l.path}
                            to={l.path}
                            className={`nav-link ${location.pathname === l.path ? 'active' : ''}`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <span className="nav-icon">{l.icon}</span> {l.label}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="navbar-actions">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        title="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                        )}
                    </button>

                    {isAdmin && (
                        <button className="btn btn-secondary nav-btn hide-mobile" onClick={() => { logout(); navigate('/'); }}>
                            Logout
                        </button>
                    )}

                    {/* Mobile Hamburger */}
                    <button
                        className={`hamburger ${menuOpen ? 'open' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </nav>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
                    <div className="mobile-menu" onClick={e => e.stopPropagation()}>
                        {navLinks.map((l, i) => (
                            <Link
                                key={l.path}
                                to={l.path}
                                className={`mobile-link ${location.pathname === l.path ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{l.icon}</span>
                                {l.label}
                            </Link>
                        ))}
                        <div className="divider" style={{ margin: '8px 0', opacity: 0.5 }} />
                        <Link to="/visitor-tour" className="mobile-link" onClick={() => setMenuOpen(false)}>
                            Visitor Tour
                        </Link>
                        {isAdmin && (
                            <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>
                                Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
