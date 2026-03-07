const express = require('express');
const QRCode = require('qrcode');
const authMiddleware = require('../middleware/auth');
const db = require('../data/db');

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM locations ORDER BY name ASC').all();
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', (req, res) => {
    try {
        const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(Number(req.params.id));
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// [PUBLIC] Add a new location - No Auth Required
router.post('/', async (req, res) => {
    console.log(`📥 [API] Adding new location: ${req.body.name}`);
    try {
        const { name, type, floor, building, description, lat, lng } = req.body;
        const result = db.prepare(
            'INSERT INTO locations (name, type, floor, building, description, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(name, type, Number(floor) || 0, building, description || '', Number(lat) || 0, Number(lng) || 0);
        const id = result.lastInsertRowid;
        const qrData = `http://localhost:5173/ar-navigation?dest=${id}`;
        const qrCode = await QRCode.toDataURL(qrData);
        db.prepare('UPDATE locations SET qrCode = ? WHERE id = ?').run(qrCode, id);
        const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
        res.status(201).json(location);
    } catch (err) {
        console.error(`❌ [API] Failed to add: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// [PUBLIC] Update a location - No Auth Required
router.put('/:id', (req, res) => {
    console.log(`📥 [API] Updating location ID ${req.params.id}: ${req.body.name}`);
    try {
        const { name, type, floor, building, description, lat, lng } = req.body;
        db.prepare(
            'UPDATE locations SET name=?, type=?, floor=?, building=?, description=?, lat=?, lng=? WHERE id=?'
        ).run(name, type, Number(floor) || 0, building, description || '', Number(lat) || 0, Number(lng) || 0, Number(req.params.id));
        const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(Number(req.params.id));
        res.json(location);
    } catch (err) {
        console.error(`❌ [API] Failed to update: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM locations WHERE id = ?').run(Number(req.params.id));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;