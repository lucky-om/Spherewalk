import React, { useState, useEffect } from 'react';
import { getLocations, updateLocation, addLocation } from '../services/api';
import './ARNavigation.css';

export default function LocationCollector() {
    const [locations, setLocations] = useState([]);
    const [bulkText, setBulkText] = useState('');
    const [status, setStatus] = useState('');
    const [debugLogs, setDebugLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiConnected, setApiConnected] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await getLocations();
                setLocations(res.data);
                setApiConnected(true);
                addLog("Connected to Database. " + res.data.length + " locations found.");
            } catch (e) {
                console.error("API Error:", e);
                setApiConnected(false);
                setStatus("⚠️ Backend not reachable.");
                addLog("ERROR: Cannot reach backend on port 5000. Check if server is running.");
            }
        };
        init();
    }, []);

    const addLog = (msg) => {
        setDebugLogs(prev => [msg, ...prev].slice(0, 10));
    };

    const handleBulkSync = async () => {
        if (!bulkText.trim()) return setStatus("Please paste some data first!");

        setLoading(true);
        setStatus('Processing Bulk Sync...');
        setDebugLogs([]); // Clear logs for new sync
        let successCount = 0;
        let errorCount = 0;

        // Split by any newline format (Windows/Unix)
        const lines = bulkText.split(/\r?\n/).filter(l => l.trim() !== '');
        addLog(`Found ${lines.length} lines to process.`);

        for (const line of lines) {
            // Format: Building Name, Lat, Lng
            const parts = line.split(',').map(p => p.trim());

            if (parts.length < 3) {
                addLog(`Format Error: Line "${line}" needs 3 parts (Name, Lat, Lng).`);
                errorCount++;
                continue;
            }

            const name = parts[0];
            const lat = parseFloat(parts[1]);
            const lng = parseFloat(parts[2]);

            if (isNaN(lat) || isNaN(lng)) {
                addLog(`Value Error: Invalid coordinates for "${name}".`);
                errorCount++;
                continue;
            }

            try {
                // Find existing (handle case sensitivity and duplicates)
                const existing = locations.find(l => l.name.toLowerCase().trim() === name.toLowerCase().trim());

                if (existing) {
                    addLog(`Updating existing: ${name}...`);
                    await updateLocation(existing.id, { ...existing, lat, lng });
                } else {
                    addLog(`Adding NEW: ${name}...`);
                    await addLocation({
                        name,
                        type: 'point_of_interest',
                        building: 'Campus',
                        lat,
                        lng,
                        description: 'Bulk imported'
                    });
                }
                successCount++;
            } catch (e) {
                const errMsg = e.response?.data?.error || e.message;
                addLog(`API FAILED for "${name}": ${errMsg}`);
                errorCount++;
            }
        }

        setStatus(`Sync Complete! ✅ ${successCount} saved, ❌ ${errorCount} errors.`);

        // Final refresh
        try {
            const res = await getLocations();
            setLocations(res.data);
            addLog("Database Refreshed.");
        } catch (e) { }

        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0c', color: '#fff', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '900px', margin: 'auto' }}>
                <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(to right, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Campus Data Sync
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
                        Rapid Deployment tool for SCET Campus Navigation
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>

                    {/* Left: Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Paste Google Maps List</h2>
                            <textarea
                                placeholder="Example:
Library, 21.17364, 72.82115
Canteen, 21.17335, 72.82180"
                                style={{
                                    width: '100%', height: '200px', background: '#000', border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '15px', borderRadius: '12px', color: '#10B981', fontFamily: 'monospace', outline: 'none'
                                }}
                                value={bulkText}
                                onChange={e => setBulkText(e.target.value)}
                            />
                            <button
                                onClick={handleBulkSync}
                                disabled={loading || !apiConnected}
                                style={{
                                    width: '100%', background: '#10B981', color: '#fff', padding: '15px', borderRadius: '12px',
                                    fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '15px',
                                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
                                }}
                            >
                                {loading ? 'SYNCING...' : '⚡ SYNC TO DATABASE'}
                            </button>
                        </div>

                        {/* Debug Logs Section */}
                        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', height: '180px', overflowY: 'auto' }}>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Debug Console</div>
                            {debugLogs.length === 0 && <div style={{ fontSize: '12px', opacity: 0.3 }}>Empty...</div>}
                            {debugLogs.map((log, i) => (
                                <div key={i} style={{ fontSize: '12px', marginBottom: '4px', color: log.includes('ERROR') || log.includes('FAILED') ? '#ef4444' : '#10B981' }}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Current DB */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Database Status</h2>
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px' }}>
                            {locations.map(l => (
                                <div key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{l.name}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.5 }}>
                                        {l.lat !== 0 ? `${l.lat.toFixed(5)}, ${l.lng.toFixed(5)}` : '⚠️ No Coordinates'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {status && (
                    <div style={{ marginTop: '20px', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', textAlign: 'center', fontWeight: 'bold' }}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
