const express = require('express');
const authMiddleware = require('../middleware/auth');
const db = require('../data/db');

const router = express.Router();

router.post('/search', (req, res) => {
    try {
        const { query, locationId } = req.body;
        db.prepare('INSERT INTO searches (query, locationId) VALUES (?, ?)').run(query, locationId ? Number(locationId) : null);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', authMiddleware, (req, res) => {
    try {
        const searches = db.prepare('SELECT s.*, l.name as locationName FROM searches s LEFT JOIN locations l ON s.locationId = l.id ORDER BY s.timestamp DESC LIMIT 200').all();
        const queryCount = {};
        searches.forEach(s => { queryCount[s.query] = (queryCount[s.query] || 0) + 1; });
        const topQueries = Object.entries(queryCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([query, count]) => ({ query, count }));
        const locCount = {};
        searches.filter(s => s.locationName).forEach(s => { locCount[s.locationName] = (locCount[s.locationName] || 0) + 1; });
        const topLocations = Object.entries(locCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));
        res.json({ topQueries, topLocations, totalSearches: searches.length });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
