import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getLocations, logSearch } from '../services/api';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import './ARNavigation.css';

const DESTS = [
    { id: 'cs-lab', label: 'Computer Lab', angle: 0, dist: 3 },
    { id: 'parking', label: 'Parking', angle: 200, dist: 800 },
    { id: 'washroom', label: 'Washroom', angle: 30, dist: 50 },
    { id: 'library', label: 'Library', angle: 45, dist: 85 },
    { id: 'canteen', label: 'Canteen', angle: 120, dist: 200 },
    { id: 'auditorium', label: 'Auditorium', angle: 270, dist: 150 },
];

// Map COCO-SSD detection classes to campus destinations for contextual AR
const DEST_TO_CLASSES = {
    'cs-lab': ['laptop', 'tv', 'mouse', 'keyboard', 'cell phone'],
    'library': ['book', 'laptop'],
    'canteen': ['cup', 'bottle', 'bowl', 'dining table', 'spoon', 'fork', 'pizza', 'donut', 'cake', 'sandwich', 'hot dog', 'apple'],
    'parking': ['car', 'motorcycle', 'bus', 'truck', 'bicycle'],
    'auditorium': ['person', 'chair', 'bench'],
    'washroom': ['sink', 'toilet']
};

export default function ARNavigation() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [camError, setCamError] = useState('');
    const [selected, setSelected] = useState(null);
    const [distance, setDistance] = useState(null);
    const angleRef = useRef(0);
    const distRef = useRef(0);
    const selectedRef = useRef(null);

    // AI Object Detection States
    const [modelLoading, setModelLoading] = useState(true);
    const modelRef = useRef(null);
    const predictionsRef = useRef([]);
    const isDetectingRef = useRef(false);

    // Camera & Rendering Lifecycle
    const [videoReady, setVideoReady] = useState(false);
    const [videoStream, setVideoStream] = useState(null);

    // Real-World Navigation States (GPS + Compass)
    const [userPos, setUserPos] = useState(null);
    const [heading, setHeading] = useState(0);
    const [needsOrientationPerm, setNeedsOrientationPerm] = useState(false);

    const geoWatchRef = useRef(null);
    const targetGPSRef = useRef(null); // Fixed coordinate once anchored
    const userPosRef = useRef(null);   // Real-time Reference for Loop
    const headingRef = useRef(0);      // Real-time Reference for Loop

    // Multiple Camera Support
    const [devices, setDevices] = useState([]);
    const [currentDeviceId, setCurrentDeviceId] = useState('');
    const [isMirrored, setIsMirrored] = useState(false);
    const [dbLocations, setDbLocations] = useState([]);
    const [showMenu, setShowMenu] = useState(false);

    // Load Machine Learning Model and List Cameras
    useEffect(() => {
        getLocations().then(res => {
            setDbLocations(res.data.filter(l => !l.isHidden));
        }).catch(e => console.error(e));

        const init = async () => {
            try {
                // Check if iOS needs permission for orientation
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    setNeedsOrientationPerm(true);
                } else {
                    window.addEventListener('deviceorientation', handleOrientation);
                }

                // Start GPS tracking
                startGPS();

                // List available video devices
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
                setDevices(videoDevices);
                if (videoDevices.length > 0) setCurrentDeviceId(videoDevices[0].deviceId);

                await tf.ready();
                const loadedModel = await cocoSsd.load();
                modelRef.current = loadedModel;
                setModelLoading(false);
            } catch (err) {
                console.error("Initialization failed", err);
                setCamError("Initialization error. Check hardware permissions.");
                setModelLoading(false);
            }
        };
        init();

        return () => {
            if (geoWatchRef.current) navigator.geolocation.clearWatch(geoWatchRef.current);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    const startGPS = () => {
        if (!navigator.geolocation) return;
        geoWatchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserPos(coords);
                userPosRef.current = coords;
            },
            (err) => console.error("GPS Error:", err),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleOrientation = (e) => {
        // webkitCompassHeading is for iOS, alpha is for Android/Standard
        const alpha = e.webkitCompassHeading || (360 - e.alpha);
        if (alpha !== undefined) {
            setHeading(alpha);
            headingRef.current = alpha;
        }
    };

    const requestOrientationPerm = async () => {
        try {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
                setNeedsOrientationPerm(false);
            }
        } catch (e) { console.error(e); }
    };

    // ML Object Detection Loop (runs at ~3 FPS to save battery)
    useEffect(() => {
        let detInterval;
        if (cameraActive && modelRef.current && videoReady) {
            detInterval = setInterval(async () => {
                if (isDetectingRef.current) return;
                const video = videoRef.current;
                if (video && video.readyState === 4) {
                    isDetectingRef.current = true;
                    try {
                        const predictions = await modelRef.current.detect(video);
                        predictionsRef.current = predictions;
                    } catch (e) { }
                    isDetectingRef.current = false;
                }
            }, 300);
        }
        return () => clearInterval(detInterval);
    }, [cameraActive, modelLoading, videoReady]);

    const pick = (id, label, angle, dist) => {
        const dest = { id, label, angle, dist };
        setSelected(dest);
        setDistance(dist); // Set to static dist directly from DESTS array
        targetGPSRef.current = null; // Clear previous target anchor
        selectedRef.current = dest;
        logSearch(label).catch(e => console.error(e));
    };

    /* Math Utilities for AR Navigation */
    function getBearing(lat1, lon1, lat2, lon2) {
        const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }

    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
        const Δφ = (φ2 - φ1) * Math.PI / 180, Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Anchors destination coordinates to a fixed GPS point
    const anchorDestination = (id, upos) => {
        // Check database for real coordinates first
        const dbLoc = dbLocations.find(l => {
            if (l.id === Number(id)) return true;
            if (typeof id === 'string' && l.name.toLowerCase() === id.toLowerCase()) return true;
            return false;
        });

        if (dbLoc && dbLoc.lat !== 0 && dbLoc.lng !== 0) {
            console.log(`AR_NAV_DEBUG: Using Real DB Coordinates for ${dbLoc.name}`);
            return { lat: dbLoc.lat, lng: dbLoc.lng };
        }

        // Fallback to relative offsets from DESTS mock data
        const d = DESTS.find(x => x.id === id);
        if (!d || !upos) return null;

        const R = 6371000;
        const angleRad = (d.angle * Math.PI) / 180;
        const dLat = (d.dist * Math.cos(angleRad)) / R;
        const dLon = (d.dist * Math.sin(angleRad)) / (R * Math.cos(upos.lat * Math.PI / 180));

        return {
            lat: upos.lat + dLat * (180 / Math.PI),
            lng: upos.lng + dLon * (180 / Math.PI)
        };
    };
    // --- Camera Control Logic ---

    const startCamera = async () => {
        console.log("AR_NAV_DEBUG: startCamera v3.2 called");
        setCamError('');
        try {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
            }

            const constraints = currentDeviceId
                ? { video: { deviceId: { exact: currentDeviceId } } }
                : { video: { facingMode: 'environment' } };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Check if we're using a front camera to auto-flip
            const track = stream.getVideoTracks()[0];
            const settings = track.getSettings();
            setIsMirrored(settings.facingMode === 'user' || currentDeviceId.toLowerCase().includes('front'));

            console.log("AR_NAV_DEBUG: Stream acquired successfully");
            setVideoStream(stream);
            setCameraActive(true);

        } catch (err) {
            console.error("AR_NAV_DEBUG: Final Error:", err);
            if (err.name === 'NotAllowedError') {
                setCamError('Permission denied. Please grant camera access in site settings.');
            } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
                // Fallback to any camera if exact device/facingMode fails
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    setVideoStream(stream);
                    setCameraActive(true);
                    return;
                } catch (e) {
                    setCamError('Could not start any camera source.');
                }
            } else {
                setCamError(`Camera Error: ${err.message}`);
            }
        }
    };

    // Attach stream to video element once it exists in the DOM
    useEffect(() => {
        if (cameraActive && videoStream && videoRef.current) {
            console.log("AR_NAV_DEBUG: Video element found, attaching stream...");
            if (videoRef.current.srcObject !== videoStream) {
                videoRef.current.srcObject = videoStream;
            }
        }
    }, [cameraActive, videoStream]);

    const handleVideoMetadata = () => {
        console.log("AR_NAV_DEBUG: Video Metadata Loaded");
        if (videoRef.current) {
            videoRef.current.play().then(() => {
                console.log("AR_NAV_DEBUG: Video Playing");
                setVideoReady(true);
                drawAR();
            }).catch(e => console.error("Play auto-start failed:", e));
        }
    };

    const switchCamera = (dir = 1) => {
        if (devices.length < 2) return;
        setVideoReady(false); // Reset ready state during switch
        const currentIdx = devices.findIndex(d => d.deviceId === currentDeviceId);
        let nextIdx = (currentIdx + dir) % devices.length;
        if (nextIdx < 0) nextIdx = devices.length - 1;
        setCurrentDeviceId(devices[nextIdx].deviceId);
    };

    useEffect(() => {
        if (cameraActive) startCamera();
    }, [currentDeviceId]);

    const drawAR = () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        let t = 0;
        const frame = () => {
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2, cy = canvas.height / 2;

            // --- REAL NAVIGATION: Update Bearing and Distance from GPS/Compass ---
            const upos = userPosRef.current;
            const h = headingRef.current;
            const activeDest = selectedRef.current;

            if (activeDest && upos) {
                // Anchor the destination if not already done
                if (!targetGPSRef.current) {
                    targetGPSRef.current = anchorDestination(activeDest.id, upos);
                }

                if (targetGPSRef.current) {
                    const realDist = getDistance(upos.lat, upos.lng, targetGPSRef.current.lat, targetGPSRef.current.lng);
                    const targetBearing = getBearing(upos.lat, upos.lng, targetGPSRef.current.lat, targetGPSRef.current.lng);

                    const relativeAngle = (targetBearing - h + 360) % 360;
                    angleRef.current = relativeAngle;
                    distRef.current = realDist;
                    // Intentionally commenting out resetting setDistance to realDist 
                    // so we keep the static DESTS dict dist value displayed 
                    // setDistance(Math.round(realDist));
                }
            }

            // --- AI VISION: Draw Boundings Boxes ---
            const preds = predictionsRef.current || [];
            const targetClasses = activeDest ? (DEST_TO_CLASSES[activeDest.id] || []) : [];

            if (video.videoWidth > 0 && video.videoHeight > 0) {
                // Calculate video object-fit: cover scaling
                const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
                const renderW = video.videoWidth * scale;
                const renderH = video.videoHeight * scale;
                const offsetX = (canvas.width - renderW) / 2;
                const offsetY = (canvas.height - renderH) / 2;

                preds.forEach(p => {
                    const [bx, by, bw, bh] = p.bbox;
                    const x = bx * scale + offsetX;
                    const y = by * scale + offsetY;
                    const w = bw * scale;
                    const h = bh * scale;

                    const isTarget = activeDest && targetClasses.includes(p.class.toLowerCase());

                    ctx.save();
                    // Draw futuristic bounding box
                    ctx.strokeStyle = isTarget ? '#10B981' : 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = isTarget ? 3 : 1;
                    if (isTarget) {
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = '#10B981';
                    }

                    // Draw corners instead of full box for sci-fi AR look
                    const clen = Math.min(20, w / 4, h / 4);
                    ctx.beginPath();
                    // TL
                    ctx.moveTo(x, y + clen); ctx.lineTo(x, y); ctx.lineTo(x + clen, y);
                    // TR
                    ctx.moveTo(x + w - clen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + clen);
                    // BR
                    ctx.moveTo(x + w, y + h - clen); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - clen, y + h);
                    // BL
                    ctx.moveTo(x + clen, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - clen);
                    ctx.stroke();

                    // Overlay and text
                    if (isTarget) {
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
                        ctx.fillRect(x, y, w, h);
                        ctx.fillStyle = '#10B981';
                        ctx.font = 'bold 14px Inter, sans-serif';
                        ctx.fillText(`TARGET: ${p.class.toUpperCase()} ${Math.round(p.score * 100)}%`, x, y > 20 ? y - 8 : y + 24);

                        // Draw line connecting center of screen (user) to target object
                        ctx.beginPath();
                        ctx.moveTo(cx, cy * 1.5);
                        ctx.lineTo(x + w / 2, y + h / 2);
                        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
                        ctx.setLineDash([5, 5]);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                        ctx.font = '12px Inter, sans-serif';
                        ctx.fillText(`${p.class}`, x, y > 15 ? y - 4 : y + 16);
                    }
                    ctx.restore();
                });
            }

            // --- NAVIGATION UI: Scanlines and Global Arrows ---
            ctx.strokeStyle = 'rgba(14,165,233,0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.height; i += 14) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

            // Floating 3D Arrow (Dynamic size based on distance)
            const rad = ((angleRef.current - 90) * Math.PI) / 180;
            const bounce = Math.sin(t * 0.06) * 10;
            const distFactor = activeDest ? Math.max(0.5, Math.min(1.5, 200 / distRef.current)) : 1;
            const ax = cx + Math.cos(rad) * (130 * distFactor + bounce);
            const ay = cy + Math.sin(rad) * (130 * distFactor + bounce);

            for (let r = 32; r >= 12; r -= 8) {
                ctx.beginPath(); ctx.arc(ax, ay, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(91,79,233,${(32 - r) / 400})`; ctx.fill();
            }
            ctx.save(); ctx.translate(ax, ay); ctx.rotate(rad + Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(0, -22); ctx.lineTo(12, 8); ctx.lineTo(5, 4); ctx.lineTo(5, 22); ctx.lineTo(-5, 22); ctx.lineTo(-5, 4); ctx.lineTo(-12, 8);
            ctx.closePath();
            ctx.fillStyle = '#fff'; ctx.shadowBlur = 18; ctx.shadowColor = '#5B4FE9'; ctx.fill(); ctx.restore();

            [1, 2].forEach(i => {
                ctx.save(); ctx.globalAlpha = 0.3 / i;
                const ax2 = cx + Math.cos(rad) * (80 - i * 28 + bounce * 0.5);
                const ay2 = cy + Math.sin(rad) * (80 - i * 28 + bounce * 0.5);
                ctx.translate(ax2, ay2); ctx.rotate(rad + Math.PI / 2);
                ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(8, 5); ctx.lineTo(-8, 5); ctx.closePath();
                ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
            });

            // Destination Label
            if (activeDest) {
                const lx = cx + Math.cos(rad) * 168, ly = cy + Math.sin(rad) * 168;
                ctx.save();
                const tw = ctx.measureText(activeDest.label).width;
                ctx.font = 'bold 13px Inter, sans-serif';
                ctx.fillStyle = 'rgba(0,0,0,0.65)';
                roundRect(ctx, lx - tw / 2 - 10, ly - 14, tw + 20, 28, 7); ctx.fill();
                ctx.strokeStyle = 'rgba(91,79,233,0.6)'; ctx.lineWidth = 1; ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(activeDest.label, lx, ly); ctx.restore();
            }

            // Centered Crosshair
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
            [[cx - 22, cy, cx - 10, cy], [cx + 10, cy, cx + 22, cy], [cx, cy - 22, cx, cy - 10], [cx, cy + 10, cx, cy + 22]].forEach(([x1, y1, x2, y2]) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });

            t++; animRef.current = requestAnimationFrame(frame);
        };
        frame();
    };

    const roundRect = (ctx, x, y, w, h, r) => {
        ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
    };

    useEffect(() => () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(tr => tr.stop());
    }, []);

    // Initial State View (Before Camera is Active)
    if (!cameraActive) {
        return (
            <div className="ar-page page">
                <div className="ar-spacer" style={{ height: '80px' }} />
                <div className="ar-start">
                    <div className="ar-start-card card card-p-lg">
                        <h1>AI + AR Navigation</h1>
                        <p>Select your destination, enable the camera, and see real-world objects contextually tracked by AI via Vision Model.</p>

                        {camError ? (
                            <div className="alert alert-error">{camError}</div>
                        ) : modelLoading ? (
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
                                ⏳ Downloading ML Vision Model... (approx 3MB)
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
                                ✓ AI Vision Model Loaded
                            </div>
                        )}

                        <div className="ar-dest-grid">
                            {DESTS.map(d => (
                                <button key={d.id} className={`ar-dest-btn ${selected?.id === d.id ? 'selected' : ''}`}
                                    onClick={() => pick(d.id, d.label, d.angle, d.dist)}>
                                    <span>{d.label}</span>
                                </button>
                            ))}
                        </div>
                        <button className="btn btn-primary btn-lg w-full" onClick={startCamera} disabled={modelLoading}>
                            {modelLoading ? 'Loading AI...' : 'Enable AI Camera & Start AR'}
                        </button>

                        {needsOrientationPerm && (
                            <button className="btn btn-secondary w-full" style={{ marginTop: '12px' }} onClick={requestOrientationPerm}>
                                Calibrate Compass (Required for iOS)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // AR HUD View (Camera Active)
    return (
        <div className="ar-view">
            <style>{`.sphere-guide-fab { display: none !important; }`}</style>
            <video
                ref={videoRef}
                className="ar-video"
                autoPlay
                playsInline
                muted
                onLoadedMetadata={handleVideoMetadata}
                style={{
                    transform: isMirrored ? 'scaleX(-1)' : 'none',
                    opacity: videoReady ? 1 : 0,
                    transition: 'opacity 0.5s ease'
                }}
            />
            <canvas ref={canvasRef} className="ar-canvas" style={{ opacity: videoReady ? 1 : 0 }} />

            {!videoReady && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', zIndex: 200 }}>
                    <div style={{ fontWeight: '600', fontSize: '1.2rem' }}>Initializing Hardware...</div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Checking video feed...</div>
                </div>
            )}

            {/* AI HUD Overlay */}
            <div style={{ position: 'absolute', top: 80, left: 20, zIndex: 100, pointerEvents: 'none' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10B981', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    <span style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                    VISION AI ACTIVE (COCO-SSD)
                </div>
            </div>

            {/* Camera Options */}
            <div style={{ position: 'absolute', top: 80, right: 20, zIndex: 100, display: 'flex', gap: '8px' }}>
                {devices.length > 1 && (
                    <button className="ar-ctrl" onClick={() => switchCamera()} title="Switch Camera">
                        Switch Camera
                    </button>
                )}
                <button className="ar-ctrl" onClick={() => setIsMirrored(!isMirrored)} title="Toggle Mirror">
                    {isMirrored ? 'Normal' : 'Mirror'}
                </button>
            </div>

            {/* Meter Overlay for Sensors */}
            <div style={{ position: 'absolute', top: 120, left: 20, zIndex: 100, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ background: userPos ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                    {userPos ? 'GPS ACTIVE' : 'SEARCHING GPS...'}
                </div>
                <div style={{ background: heading !== 0 ? 'rgba(59, 130, 246, 0.7)' : 'rgba(239, 68, 68, 0.7)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                    COMPASS: {Math.round(heading)}°
                </div>
            </div>

            <div className="ar-hud">
                <div className="ar-hud-info">
                    {selected && (
                        <div className="ar-info-card">
                            <div className="ar-dest-name">{selected.label}</div>
                            <div className="ar-dest-km">~{distance}m</div>
                            <div className="ar-dist-bar"><div className="ar-dist-progress" style={{ width: `10%` }} /></div>
                            <button className="ar-ctrl" style={{ marginTop: '10px', fontSize: '10px', padding: '4px 10px' }} onClick={() => setShowMenu(!showMenu)}>
                                {showMenu ? 'Close Menu' : 'Change Location'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Compact Menu (Collapsible) */}
                <div className="ar-controls-wrap" style={{
                    display: showMenu ? 'flex' : 'none',
                    maxHeight: '40vh',
                    overflowY: 'auto',
                    padding: '10px',
                    borderRadius: '20px 20px 0 0',
                    background: 'rgba(0,0,0,0.8)'
                }}>
                    {DESTS.map(d => (
                        <button key={d.id} className={`ar-ctrl ${selected?.id === d.id ? 'active' : ''}`}
                            style={{ borderColor: 'rgba(16, 185, 129, 0.5)', width: '100%', marginBottom: '4px' }}
                            onClick={() => { pick(d.id, d.label, d.angle, d.dist); setShowMenu(false); }}>
                            {d.label}
                        </button>
                    ))}
                </div>

                {/* Back Button */}
                <button
                    onClick={() => setCameraActive(false)}
                    style={{ position: 'absolute', bottom: 30, right: 20, background: 'rgba(239, 68, 68, 0.6)', border: 'none', color: '#fff', padding: '10px 15px', borderRadius: '40px', fontSize: '0.7rem', fontWeight: 'bold', pointerEvents: 'all' }}
                >
                    Exit AR
                </button>
            </div>

            {distance !== null && distance <= 10 && (
                <div className="ar-arrived">
                    <div className="ar-arrived-inner">
                        <h2>Arrived!</h2>
                        <p>You've reached <strong style={{ color: '#fff' }}>{selected?.label}</strong></p>
                    </div>
                </div>
            )}
        </div>
    );
}
