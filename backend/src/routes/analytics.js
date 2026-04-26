/* Coded by Lucky */
/* SphereWalk Campus Explorer | Analytics Route */
const express       = require('express');
const rateLimit     = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const db            = require('../data/db');

const router = express.Router();

// Tight rate-limit on public analytics logging to prevent DB spam
const analyticsLimiter = rateLimit({
    windowMs: 60 * 1000,   // 1 minute
    max: 10,               // 10 logs per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many analytics requests. Slow down.' },
});

router.post('/search', analyticsLimiter, (req, res) => {
    try {
        const { query, locationId } = req.body;
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({ error: 'query is required.' });
        }
        const safeQuery = query.trim().substring(0, 200);
        const safeLocId = locationId && Number.isInteger(Number(locationId)) && Number(locationId) > 0
            ? Number(locationId) : null;
        db.prepare('INSERT INTO searches (query, locationId) VALUES (?, ?)').run(safeQuery, safeLocId);
        res.json({ success: true });
    } catch (err) {
        console.error('[ANALYTICS] POST error:', err.message);
        res.status(500).json({ error: 'Failed to log search.' });
    }
});

router.get('/', authMiddleware, (req, res) => {
    try {
        const searches = db.prepare(
            'SELECT s.*, l.name as locationName FROM searches s LEFT JOIN locations l ON s.locationId = l.id ORDER BY s.timestamp DESC LIMIT 200'
        ).all();
        const locations = db.prepare('SELECT name FROM locations').all();

        const queryCount = {};
        searches.forEach(s => { queryCount[s.query] = (queryCount[s.query] || 0) + 1; });
        const topQueries = Object.entries(queryCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([query, count]) => ({ query, count }));
        
        const locCount = {};
        searches.forEach(s => { 
            if (s.locationName) {
                locCount[s.locationName] = (locCount[s.locationName] || 0) + 1;
            } else {
                const matched = locations.find(l => s.query.toLowerCase().includes(l.name.toLowerCase()));
                if (matched) {
                    locCount[matched.name] = (locCount[matched.name] || 0) + 1;
                }
            }
        });
        const topLocations = Object.entries(locCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));
        res.json({ topQueries, topLocations, totalSearches: searches.length });
    } catch (err) {
        console.error('[ANALYTICS] GET error:', err.message);
        res.status(500).json({ error: 'Failed to fetch analytics.' });
    }
});

module.exports = router;
