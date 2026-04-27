/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
/* Coded by Lucky */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { getLocations, logSearch } from '../services/api';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import './ARNavigation.css';

// Map COCO-SSD detection classes to campus destinations for contextual AR
const DEST_TO_CLASSES = {
    'cs-lab': ['laptop', 'tv', 'mouse', 'keyboard', 'cell phone'],
    'mca': ['laptop', 'tv', 'mouse', 'keyboard', 'cell phone'],
    'library': ['book', 'laptop'],
    'canteen': ['cup', 'bottle', 'bowl', 'dining table', 'spoon', 'fork', 'pizza', 'donut', 'cake', 'sandwich', 'hot dog', 'apple'],
    'parking': ['car', 'motorcycle', 'bus', 'truck', 'bicycle'],
    'auditorium': ['person', 'chair', 'bench'],
    'washroom': ['sink', 'toilet'],
    'admin': ['laptop', 'keyboard', 'book']
};

// Hardcoded GPS fallback — used if DB has wrong/zero coordinates
// These are real-world approximate coords for SCET Surat campus
const CAMPUS_GPS_COORDS = {
    'Computer Lab 1':       { lat: 21.183742, lng: 72.814352 },
    'Computer Lab 2':       { lat: 21.183745, lng: 72.814355 },
    'IT Lab':               { lat: 21.183750, lng: 72.814360 },
    'Library':              { lat: 21.183610, lng: 72.814100 },
    'Auditorium':           { lat: 21.183492, lng: 72.814392 },
    'Canteen':              { lat: 21.183300, lng: 72.814500 },
    'Parking':              { lat: 21.183200, lng: 72.814200 },
    'Washroom (CS Block)':  { lat: 21.183700, lng: 72.814300 },
    'Admin Office':         { lat: 21.183400, lng: 72.814400 },
    'Placement Cell':       { lat: 21.183410, lng: 72.814410 },
    'Medical Room':         { lat: 21.183420, lng: 72.814420 },
    'Main Gate':            { lat: 21.183100, lng: 72.814100 },
};

export default function ARNavigation() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [virtualCamera, setVirtualCamera] = useState(false);
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

    const pick = useCallback((id, label) => {
        const dest = { id, label };
        setSelected(dest);
        setDistance('Calculating...'); // Let the GPS loop assign actual distance natively via setDistance(realDist)
        targetGPSRef.current = null;
        selectedRef.current = dest;
        logSearch(label).catch(e => console.error(e));
    }, []);

    // Load Machine Learning Model and List Cameras
    useEffect(() => {
        getLocations().then(res => {
            const fetchedLocs = res.data.filter(l => !l.isHidden);
            setDbLocations(fetchedLocs);

            // Handle incoming navigation target from URL (sent by chatbot)
            const params = new URLSearchParams(window.location.search);
            const targetDestId = params.get('dest');
            const targetDestLabel = params.get('destLabel');
            if (targetDestId && targetDestLabel) {
                pick(targetDestId, targetDestLabel);
            }
        }).catch(() => { });

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } catch (err) { console.error("Orientation permission error:", err); }
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
                    } catch {
                        // Prediction failed, silent ignore
                    }
                    isDetectingRef.current = false;
                }
            }, 300);
        }
        return () => clearInterval(detInterval);
    }, [cameraActive, modelLoading, videoReady]);

    // Pick moved up to prevent ReferenceError

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
        // 1. Check database for real GPS coordinates first
        const dbLoc = dbLocations.find(l => {
            if (l.id === Number(id)) return true;
            if (typeof id === 'string' && l.name && l.name.toLowerCase() === id.toLowerCase()) return true;
            return false;
        });

        // Valid GPS range: lat must be -90 to 90, lng -180 to 180, non-zero
        const isValidGPS = (lat, lng) => lat !== 0 && lng !== 0 && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

        if (dbLoc && isValidGPS(dbLoc.lat, dbLoc.lng)) {
            console.log(`AR: Using DB GPS for "${dbLoc.name}": ${dbLoc.lat}, ${dbLoc.lng}`);
            return { lat: dbLoc.lat, lng: dbLoc.lng };
        }

        // 2. Fallback: use hardcoded campus GPS map by name
        if (dbLoc && CAMPUS_GPS_COORDS[dbLoc.name]) {
            console.log(`AR: Using hardcoded GPS for "${dbLoc.name}"`);
            return CAMPUS_GPS_COORDS[dbLoc.name];
        }

        // 3. Try matching by label directly
        const labelMatch = Object.keys(CAMPUS_GPS_COORDS).find(
            k => k.toLowerCase() === (selectedRef.current?.label || '').toLowerCase()
        );
        if (labelMatch) {
            console.log(`AR: Using label-matched GPS for "${labelMatch}"`);
            return CAMPUS_GPS_COORDS[labelMatch];
        }

        // 4. Last resort: return user position so distance = 0m (destination unknown)
        console.warn(`AR: No GPS found for id=${id}, using user position as fallback`);
        return { lat: upos.lat, lng: upos.lng };
    };
    // --- Camera Control Logic ---

    const startCamera = useCallback(async () => {
        setCamError('');
        try {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
            }

            const constraints = currentDeviceId
                ? { video: { deviceId: { exact: currentDeviceId } } }
                : { video: { facingMode: { ideal: 'environment' } } };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Fetch real devices now that we have permission
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
            setDevices(videoDevices);

            // Check if we're using a front camera to auto-flip
            const track = stream.getVideoTracks()[0];
            const settings = track.getSettings();
            setIsMirrored(settings.facingMode === 'user' || (currentDeviceId && currentDeviceId.toLowerCase().includes('front')));

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
                    
                    const allDevices = await navigator.mediaDevices.enumerateDevices();
                    setDevices(allDevices.filter(d => d.kind === 'videoinput'));
                    return;
                } catch {
                    setCamError('Could not start any camera source. Falling back to Virtual Mode.');
                    setVirtualCamera(true);
                    setCameraActive(true);
                }
            } else {
                setCamError(`Camera Error: ${err.message}`);
                // Fallback: Enable AR Canvas without camera feed!
                setVirtualCamera(true);
                setCameraActive(true);
            }
        }
    }, [currentDeviceId, videoStream]);

    // Attach stream to video element once it exists in the DOM
    useEffect(() => {
        if (cameraActive && virtualCamera) {
            setVideoReady(true);
            setTimeout(drawAR, 100);
        } else if (cameraActive && videoStream && videoRef.current) {
            const vid = videoRef.current;
            if (vid.srcObject !== videoStream) {
                vid.srcObject = videoStream;
            }
            // Force play immediately — don't rely only on onLoadedMetadata (unreliable on mobile)
            vid.play().then(() => {
                setVideoReady(true);
                drawAR();
            }).catch(e => {
                console.warn('Autoplay blocked, waiting for metadata:', e);
                // Fallback: wait for metadata event
            });
            // Safety timeout: if video still not ready after 3s, force it
            const timeout = setTimeout(() => {
                if (!videoRef.current) return;
                setVideoReady(true);
                drawAR();
            }, 3000);
            return () => clearTimeout(timeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cameraActive, videoStream, virtualCamera]);

    const handleVideoMetadata = () => {
        if (videoRef.current) {
            videoRef.current.play().then(() => {
                setVideoReady(true);
                drawAR();
            }).catch(e => console.error('Play failed:', e));
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
    }, [currentDeviceId, cameraActive, startCamera]);

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
            let upos = userPosRef.current;
            let currentHeading = headingRef.current;
            const activeDest = selectedRef.current;

            if (activeDest && upos) {
                // Anchor the destination if not already done
                if (!targetGPSRef.current) {
                    targetGPSRef.current = anchorDestination(activeDest.id, upos);
                }

                if (targetGPSRef.current && typeof targetGPSRef.current.lat === 'number' && typeof targetGPSRef.current.lng === 'number') {
                    const realDist = getDistance(upos.lat, upos.lng, targetGPSRef.current.lat, targetGPSRef.current.lng);
                    const targetBearing = getBearing(upos.lat, upos.lng, targetGPSRef.current.lat, targetGPSRef.current.lng);

                    const relativeAngle = (targetBearing - currentHeading + 360) % 360;
                    angleRef.current = isNaN(relativeAngle) ? 0 : relativeAngle;
                    
                    // Only update React state if distance changed significantly to prevent render lag
                    if (!isNaN(realDist) && (Math.abs(distRef.current - realDist) > 1 || distRef.current === 0)) {
                        setDistance(Math.round(realDist)); 
                        distRef.current = realDist;
                    }
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

            // Only draw arrow when a destination is selected
            if (activeDest) {
                // Floating 3D Arrow (Dynamic size based on distance)
                const rad = ((angleRef.current - 90) * Math.PI) / 180;
                const bounce = Math.sin(t * 0.06) * 10;
                const distFactor = Math.max(0.5, Math.min(1.5, 200 / (distRef.current || 200)));
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
                const lx = cx + Math.cos(rad) * 168, ly = cy + Math.sin(rad) * 168;
                ctx.save();
                ctx.font = 'bold 13px Inter, sans-serif';
                const tw = ctx.measureText(activeDest.label).width;
                ctx.fillStyle = 'rgba(0,0,0,0.65)';
                roundRect(ctx, lx - tw / 2 - 10, ly - 14, tw + 20, 28, 7); ctx.fill();
                ctx.strokeStyle = 'rgba(91,79,233,0.6)'; ctx.lineWidth = 1; ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(activeDest.label, lx, ly); ctx.restore();

                // No GPS warning
                if (!upos) {
                    ctx.save();
                    ctx.font = 'bold 13px Inter, sans-serif';
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    const msg = 'Searching GPS...';
                    const mw = ctx.measureText(msg).width + 24;
                    roundRect(ctx, cx - mw/2, cy - 80, mw, 32, 8); ctx.fill();
                    ctx.fillStyle = '#FCD34D'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(msg, cx, cy - 64); ctx.restore();
                }
            } else {
                // No destination selected — draw a pulsing prompt
                ctx.save();
                ctx.font = 'bold 14px Inter, sans-serif';
                const prompt = 'Select a destination above';
                const pw = ctx.measureText(prompt).width + 32;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                roundRect(ctx, cx - pw/2, cy - 30, pw, 36, 10); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(prompt, cx, cy - 12); ctx.restore();
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
                        <p>Select destination and enable camera for AR Vision.</p>

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
                            {dbLocations.map(d => (
                                <button key={d.id} className={`ar-dest-btn ${selected?.id === d.id ? 'selected' : ''}`}
                                    onClick={() => pick(d.id, d.name)}>
                                    <span>{d.name}</span>
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

            {!videoReady && !virtualCamera && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', zIndex: 200 }}>
                    <div style={{ fontWeight: '600', fontSize: '1.2rem' }}>Initializing Hardware...</div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Checking video feed...</div>
                    <button className="ar-ctrl" style={{ marginTop: '24px', background: 'rgba(139, 92, 246, 0.4)', borderColor: '#8b5cf6', padding: '10px 20px' }} onClick={() => { setVirtualCamera(true); setVideoReady(true); }}>
                        Force Virtual Mode
                    </button>
                </div>
            )}

            {virtualCamera && (
                <div style={{ position: 'absolute', inset: 0, background: '#0a0a14', zIndex: -1 }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>
                        [ VIRTUAL AR MODE ]<br/>CAMERA OFFLINE
                    </div>
                </div>
            )}

            {/* ── Top HUD Overlay ─ no overlapping on mobile ── */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                zIndex: 100, pointerEvents: 'none',
                display: 'flex', flexDirection: 'column', gap: '6px',
                padding: '80px 12px 8px'
            }}>
                {/* Row 1: AI badge + camera controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(10,15,25,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16,185,129,0.5)', color: '#10B981', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none' }}>
                        <span style={{ width: '7px', height: '7px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981', flexShrink: 0 }} />
                        VISION AI
                    </div>
                    <div style={{ display: 'flex', gap: '6px', pointerEvents: 'all' }}>
                        {devices.length > 1 && (
                            <button className="ar-ctrl" onClick={() => switchCamera()} style={{ background: 'rgba(10,15,25,0.75)', backdropFilter: 'blur(12px)', padding: '6px 12px', fontSize: '11px' }}>
                                🔄 Cam
                            </button>
                        )}
                        <button className="ar-ctrl" onClick={() => setIsMirrored(!isMirrored)} style={{ background: 'rgba(10,15,25,0.75)', backdropFilter: 'blur(12px)', padding: '6px 12px', fontSize: '11px' }}>
                            {isMirrored ? '🔃 Normal' : '🔄 Mirror'}
                        </button>
                    </div>
                </div>

                {/* Row 2: GPS + Heading sensor badges */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', pointerEvents: 'none' }}>
                    <div style={{ background: userPos ? 'rgba(16,185,129,0.85)' : 'rgba(239,68,68,0.85)', backdropFilter: 'blur(10px)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                        {userPos ? '📍 GPS ✔' : '📍 GPS...'}
                    </div>
                    <div style={{ background: headingRef.current !== null ? 'rgba(99,102,241,0.85)' : 'rgba(100,100,100,0.85)', backdropFilter: 'blur(10px)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                        {headingRef.current !== null ? `🧭 ${Math.round(headingRef.current)}°` : '🧭 No Compass'}
                    </div>
                    {userPos && (
                        <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,0.7)', padding: '3px 10px', borderRadius: '6px', fontSize: '10px' }}>
                            {userPos.lat.toFixed(5)}, {userPos.lng.toFixed(5)}
                        </div>
                    )}
                </div>
            </div>

            <div className="ar-hud">
                <div className="ar-hud-info">
                    {selected && (
                        <div className="ar-info-card">
                            <div className="ar-scan-bar"></div>
                            <div className="ar-dest-name">Tracking: {selected.label}</div>
                            <div className="ar-dest-km">
                                {typeof distance === 'string' ? distance : (distance === null || isNaN(distance)) ? '-- m' : distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance} m`}
                            </div>

                            <div className="ar-dist-bar">
                                <div className="ar-dist-progress" style={{ width: `${isNaN(distance) ? 0 : Math.max(10, 100 - (distance / 200) * 100)}%` }} />
                            </div>

                            {/* Destination Intel Section */}
                            {dbLocations.find(l => l.id === selected.id)?.description && (
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '-12px', marginBottom: '16px', fontStyle: 'italic', lineHeight: '1.4' }}>
                                    {dbLocations.find(l => l.id === selected.id).description}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button className="ar-ctrl" style={{ fontSize: '10px', padding: '6px 14px', background: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6' }} onClick={() => setShowMenu(!showMenu)}>
                                    Change Target
                                </button>
                                {!virtualCamera && (
                                    <button className="ar-ctrl" style={{ fontSize: '10px', padding: '6px 14px', background: 'rgba(139, 92, 246, 0.2)', borderColor: '#8b5cf6' }} onClick={() => setVirtualCamera(true)}>
                                        Force Virtual AR
                                    </button>
                                )}
                                <button className="ar-ctrl" style={{ fontSize: '10px', padding: '6px 14px', background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444' }} onClick={() => setCameraActive(false)}>
                                    Exit
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Compact Menu (Collapsible) */}
                <div className="ar-controls-wrap" style={{
                    display: showMenu ? 'flex' : 'none',
                    maxHeight: '40vh',
                    overflowY: 'auto',
                    padding: '16px',
                    borderRadius: '28px 28px 0 0',
                    background: 'rgba(10, 15, 25, 0.95)',
                    backdropFilter: 'blur(32px)',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    pointerEvents: 'all',
                    flexDirection: 'column'
                }}>
                    <div style={{ width: '100%', marginBottom: '12px', fontWeight: 'bold', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
                        Select Destination
                    </div>
                    {dbLocations
                        .filter((loc, index, self) =>
                            index === self.findIndex((t) => (
                                t.name.toLowerCase().trim() === loc.name.toLowerCase().trim()
                            ))
                        )
                        .map(d => (
                            <button key={d.id} className={`ar-ctrl ${selected?.id === d.id ? 'active' : ''}`}
                                style={{ borderColor: 'rgba(91, 79, 233, 0.3)', width: '100%', marginBottom: '6px', justifyContent: 'center' }}
                                onClick={() => { pick(d.id, d.name); setShowMenu(false); }}>
                                {d.name}
                            </button>
                        ))
                    }
                </div>
            </div>

            {distance !== null && distance <= 8 && (
                <div className="ar-arrived">
                    <div className="ar-arrived-inner">
                        <div className="ar-arrival-icon">🏆</div>
                        <h2>Goal Reached</h2>
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)' }}>
                            You have successfully arrived at <strong style={{ color: '#fff' }}>{selected?.label}</strong>
                        </p>

                        <div className="ar-arrival-stats">
                            <div className="ar-stat-box">
                                <span className="ar-stat-label">Accuracy</span>
                                <span className="ar-stat-value">High</span>
                            </div>
                            <div className="ar-stat-box">
                                <span className="ar-stat-label">Arrival Time</span>
                                <span className="ar-stat-value">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <button
                            className="ar-ctrl active"
                            style={{ marginTop: '12px', padding: '14px 40px', fontSize: '1rem' }}
                            onClick={() => setCameraActive(false)}
                        >
                            Complete Journey
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
