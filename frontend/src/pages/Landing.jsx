/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
/* Coded by Lucky */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLiveEvents, getLocations } from '../services/api';
import './Landing.css';

const TEAM = [
    {
        name: 'Jeet Patel',
        role: 'Full Stack Lead',
        emoji: '🚀',
        color: '#5B4FE9',
        linkedin: 'https://www.linkedin.com/in/jeet1466/',
        github: 'https://github.com/Jeet1466',
        instagram: 'https://instagram.com/jeet__1466',
    },
    {
        name: 'Om Patel',
        role: 'Cyber Security Expert',
        emoji: '🪐',
        color: '#32e922ff',
        linkedin: 'https://linkedin.com/in/lucky-om',
        github: 'https://github.com/lucky-om',
        instagram: 'https://instagram.com/luckkyy.22',
    },
    {
        name: 'Akshit Patel',
        role: 'AR & Navigation Engineer',
        emoji: '🕶️',
        color: '#10B981',
        linkedin: 'https://linkedin.com/in/akshit-patel1115/',
        github: 'https://github.com/AkshitPatel1115',
        instagram: 'https://instagram.com/_akshit_1115',
    },
    {
        name: 'Daksh Patel',
        role: 'AI & Backend Developer',
        emoji: '🤖',
        color: '#0EA5E9',
        linkedin: 'https://linkedin.com/in/daksh-patel-476a20345/',
        github: 'https://github.com/Daksh2903',
        instagram: 'https://instagram.com/da_k_sh03',
    },
    {
        name: 'Devansh Jariwala',
        role: 'UI/UX Designer',
        emoji: '🎨',
        color: '#F59E0B',
        linkedin: 'https://linkedin.com/in/devansh-jariwala-a987993b6/',
        github: 'https://github.com/djariwala0608-git',
        instagram: 'https://instagram.com/_dev_jariwala_',
    },

];

const features = [
    {
        id: 'ar',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>,
        title: 'AR Navigation',
        desc: 'Point your camera and follow live 3D arrows anchored to the real world and Never get lost looking for a lab again.',
        path: '/ar-navigation',
        color: '#5B4FE9',
        spanClass: 'bento-span-2' // Resized down
    },
    {
        id: 'ai',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><rect width="18" height="10" x="3" y="11" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" x2="8" y1="16" y2="16" /><line x1="16" x2="16" y1="16" y2="16" /></svg>,
        title: 'Sphere Guide',
        desc: 'Ask our smart AI about placement stats, faculty, or directions. It knows immediately.',
        path: '/ai-assistant',
        color: '#10B981',
        spanClass: 'bento-span-2' // Takes up 2 columns
    },
    {
        id: 'tour',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>,
        title: '360° Tour',
        desc: 'Immersive panoramic views of labs and library.',
        path: '/virtual-tour',
        color: '#0EA5E9',
        spanClass: ''
    },
    {
        id: 'map',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" /></svg>,
        title: 'Smart Campus Map',
        desc: 'Interactive SVG map with live event dots.',
        path: '/campus-map',
        color: '#F59E0B',
        spanClass: ''
    },
    {
        id: 'visitor',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        title: 'Visitor Tour',
        desc: 'A guided 8-stop tour tailored for parents and freshers.',
        path: '/visitor-tour',
        color: '#8B5CF6',
        spanClass: 'bento-span-2'
    },
    {
        id: 'sos',
        icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
        title: 'Emergency Services',
        desc: 'Instantly alerts security, 108, fire services & contacts.',
        path: '/emergency',
        color: '#EF4444',
        spanClass: 'bento-span-4 bento-large' // Takes full row
    },
];

const stats = [
    { val: '25+', lbl: 'Acres Campus' },
    { val: '2800+', lbl: 'Students' },
    { val: '24', lbl: 'Active Labs' },
];

export default function Landing() {
    const navigate = useNavigate();
    const [liveEvents, setLiveEvents] = useState([]);
    const [locationCount, setLocationCount] = useState(0);

    useEffect(() => {
        getLiveEvents().then(r => setLiveEvents(r.data)).catch(e => console.error(e));
        getLocations().then(r => setLocationCount(r.data.filter(l => !l.isHidden).length)).catch(e => console.error(e));
    }, []);

    return (
        <div className="landing page" style={{ paddingTop: 0 }}>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg">
                    <div className="hero-orb orb-1" />
                    <div className="hero-orb orb-2" />
                    <div className="hero-orb orb-3" />
                    <div className="hero-grid" />
                </div>

                <div className="container hero-content-wrapper">
                    <div className="hero-content">
                        {/* Inline Live Event Card */}
                        {liveEvents.length > 0 && (
                            <div className="live-popup-wrapper anim-fade-up stagger-1">
                                <Link to="/campus-map" className="hero-live-popup hover-lift">
                                    <div className="live-popup-header">
                                        <span className="live-dot" />
                                        <span className="live-popup-lbl">Live Now</span>
                                    </div>
                                    <div className="live-popup-title">{liveEvents[0].title}</div>
                                    <div className="live-popup-desc">
                                        Happening now at <strong>{liveEvents[0].location}</strong>
                                    </div>
                                    <div className="live-popup-footer">
                                        View on Map <span className="live-popup-arrow">→</span>
                                    </div>
                                </Link>
                            </div>
                        )}

                        <h1 className="hero-title anim-fade-up stagger-2">
                            <span style={{ fontSize: '0.6em', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: '8px' }}>
                                Navigate Campus with
                            </span>
                            Sphere<span className="gradient-text">Walk</span>
                        </h1>

                        <p className="hero-desc anim-fade-up stagger-3">
                            The ultimate intelligent campus experience. Follow live AR arrows, explore 360° virtual spaces, and get instant answers from our Sphere Guide.
                        </p>

                        <div className="hero-cta anim-fade-up stagger-4">
                            <button className="btn btn-primary btn-lg hover-lift" onClick={() => navigate('/ar-navigation')}>
                                Start AR Navigation
                            </button>
                            <button className="btn btn-secondary btn-lg hover-lift" style={{ background: 'var(--bg-1)', backdropFilter: 'blur(10px)' }} onClick={() => navigate('/visitor-tour')}>
                                Take a Visitor Tour
                            </button>
                        </div>
                    </div>

                    {/* iPhone 17 Pro Max Mockup */}
                    <div className="hero-visual hide-mobile anim-fade-up stagger-4">
                        {/* Side buttons */}
                        <div className="iphone-btn-volume-up" />
                        <div className="iphone-btn-volume-down" />
                        <div className="iphone-btn-power" />

                        <div className="iphone-frame">
                            {/* Dynamic Island */}
                            <div className="iphone-dynamic-island" />

                            {/* Screen */}
                            <div className="iphone-screen">
                                {/* Status bar */}
                                <div className="iphone-status-bar">
                                    <span className="iphone-time">11:11</span>
                                    <div className="iphone-status-icons">
                                        <span>●●●</span>
                                        <span>WiFi</span>
                                        <span>v2.0</span>
                                    </div>
                                </div>

                                {/* AR Content */}
                                <div className="phone-scanlines" />
                                <div className="iphone-ar-scene">
                                    <div className="iphone-ar-ring" />
                                    <div className="iphone-ar-ring ring-2" />
                                    <div className="phone-arrow">▶</div>
                                    <div className="phone-label">Computer Lab · 120m</div>
                                    <div className="phone-dist">Follow the arrow</div>
                                </div>

                                {/* Bottom app bar */}
                                <div className="iphone-app-bar">
                                    <div className="iphone-app-icon"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg></div>
                                    <div className="iphone-app-icon active"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" /></svg></div>
                                    <div className="iphone-app-icon"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="11" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" x2="8" y1="16" y2="16" /><line x1="16" x2="16" y1="16" y2="16" /></svg></div>
                                    <div className="iphone-app-icon"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg></div>
                                </div>

                                {/* Home Indicator */}
                                <div className="iphone-home-indicator" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Stats Glass Bar */}
            <div className="stats-row anim-fade-up stagger-4">
                <div className="stats-glass">
                    {[...stats, { val: locationCount > 0 ? `${locationCount}+` : '150+', lbl: 'Mapped Locations' }].map((s, i) => (
                        <div key={i} className="stat-item">
                            <div className="stat-val">{s.val}</div>
                            <div className="stat-lbl">{s.lbl}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bento Grid Features */}
            <section className="features-section">
                <div className="container">
                    <div className="text-center anim-fade-up">
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '16px' }}>
                            Everything in <span className="gradient-text">One Place</span>
                        </h2>
                        <p className="text-2" style={{ maxWidth: '500px', margin: '0 auto', fontSize: '1.05rem' }}>
                            From realtime AI assistance to immersive 360° exploration, SphereWalk replaces 5 different campus apps.
                        </p>
                    </div>

                    <div className="bento-grid">
                        {features.map((f, i) => (
                            <div
                                key={f.id}
                                onClick={() => navigate(f.path)}
                                className={`bento-card anim-fade-up ${f.spanClass}`}
                                style={{ '--feat-clr': f.color, animationDelay: `${i * 100}ms`, cursor: 'pointer' }}
                            >
                                <div className="bento-bg-glow" />
                                <div className="bento-icon">{f.icon}</div>
                                <div className="bento-content">
                                    <h3>{f.title}</h3>
                                    <p>{f.desc}</p>
                                </div>

                                {/* Custom illustration for the large AR card */}
                                {f.id === 'ar' && (
                                    <div className="ar-mockup hide-mobile">
                                        <div className="ar-mockup-screen">
                                            <div className="ar-mockup-arrow">^</div>
                                            <div className="ar-mockup-label">Computer Lab · 30m</div>
                                        </div>
                                    </div>
                                )}

                                {/* Emergency call buttons */}
                                {f.id === 'sos' && (
                                    <div className="emergency-call-btns" onClick={e => e.preventDefault()}>
                                        <a href="tel:101" className="emergency-call-btn fire" onClick={e => e.stopPropagation()}>
                                            <span className="ecb-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c-2.2-.6-3-2.6-3-2.6a4.8 4.8 0 0 1 3-5.4 6 6 0 1 0 5 10A2.5 2.5 0 0 0 16 11.5" /></svg></span>
                                            <div className="ecb-info">
                                                <span className="ecb-label">Fire</span>
                                                <span className="ecb-num">101</span>
                                            </div>
                                        </a>
                                        <a href="tel:108" className="emergency-call-btn ambulance" onClick={e => e.stopPropagation()}>
                                            <span className="ecb-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /><line x1="8" x2="8" y1="8" y2="12" /><line x1="6" x2="10" y1="10" y2="10" /></svg></span>
                                            <div className="ecb-info">
                                                <span className="ecb-label">Ambulance</span>
                                                <span className="ecb-num">108</span>
                                            </div>
                                        </a>
                                        <a href="tel:100" className="emergency-call-btn police" onClick={e => e.stopPropagation()}>
                                            <span className="ecb-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></span>
                                            <div className="ecb-info">
                                                <span className="ecb-label">Police</span>
                                                <span className="ecb-num">100</span>
                                            </div>
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Branding Section */}
            <section className="team-section">
                <div className="container">
                    <div className="text-center anim-fade-up" style={{ marginBottom: '56px' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '14px' }}>
                            Meet the <span className="gradient-text">Green Node</span> Team
                        </h2>
                        <p className="text-2" style={{ maxWidth: '480px', margin: '0 auto', fontSize: '1.05rem' }}>
                            The passionate builders behind SphereWalk — crafting the future of campus navigation.
                        </p>
                    </div>
                    <div className="team-grid">
                        {TEAM.map((member, i) => (
                            <div
                                key={member.name}
                                className="team-card anim-fade-up"
                                style={{ '--tc': member.color, animationDelay: `${i * 80}ms` }}
                            >
                                <div className="team-card-glow" />
                                <div className="team-avatar" style={{ background: `${member.color}22`, border: `2px solid ${member.color}44` }}>
                                    <span style={{ fontSize: '2.4rem' }}>{member.emoji}</span>
                                </div>
                                <div className="team-info">
                                    <div className="team-name">{member.name}</div>
                                    <div className="team-role" style={{ color: member.color }}>{member.role}</div>
                                </div>
                                <div className="team-socials">
                                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="team-social-btn" title="LinkedIn">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                    </a>
                                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="team-social-btn" title="GitHub">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                                    </a>
                                    <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="team-social-btn" title="Instagram">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <div className="footer-inner container">

                    {/* Brand col */}
                    <div className="footer-brand-col">
                        <div className="footer-brand">
                            <img src="/logo.png" alt="SphereWalk" className="footer-logo" />
                            <span className="footer-brand-name">
                                <span style={{ color: 'var(--text)' }}>Sphere</span>
                                <span style={{ background: 'linear-gradient(135deg,#60a5fa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Walk</span>
                            </span>
                        </div>

                        <p className="footer-copy">© 2026 Green Node · All rights reserved.</p>
                    </div>

                    {/* Quick links */}
                    <div className="footer-col">
                        <h5 className="footer-col-title">Navigate</h5>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/campus-map">Campus Map</Link></li>
                            <li><Link to="/visitor-tour">Visitor Tour</Link></li>
                        </ul>
                    </div>

                    {/* Features */}
                    <div className="footer-col">
                        <h5 className="footer-col-title">Features</h5>
                        <ul>
                            <li><Link to="/ar-navigation">AR Navigation</Link></li>
                            <li><Link to="/virtual-tour">360° Tour</Link></li>
                            <li><Link to="/emergency">Emergency</Link></li>
                            <li><Link to="/ai-assistant">AI Assistant</Link></li>
                        </ul>
                    </div>

                    {/* Contributors */}
                    <div className="footer-col">
                        <h5 className="footer-col-title">Our Team</h5>
                        <ul>
                            {TEAM.map(m => (
                                <li key={m.name}>
                                    <a href={m.linkedin} target="_blank" rel="noopener noreferrer">
                                        <span style={{ color: m.color }}>{m.emoji}</span> {m.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                <div className="footer-bottom">
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <span>Made by Team Green Node · SphereWalk v2.0</span>
                        <div className="footer-legal-links" style={{ display: 'flex', gap: '20px' }}>
                            <Link to="/privacy-policy" style={{ fontSize: '0.8rem', opacity: 0.6 }}>Privacy Policy</Link>
                            <Link to="/terms-of-use" style={{ fontSize: '0.8rem', opacity: 0.6 }}>Terms of Use</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
