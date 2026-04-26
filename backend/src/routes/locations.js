/* Coded by Lucky */
/* SphereWalk Campus Explorer | Locations Route */
const express       = require('express');
const QRCode        = require('qrcode');
const authMiddleware = require('../middleware/auth');
const { validateLocation, validateId } = require('../middleware/validate');
const db            = require('../data/db');

const router = express.Router();

// ── GET all (public — but filters hidden unless ?admin=1 + auth) ──────────────
router.get('/', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM locations ORDER BY name ASC').all();
        res.json(rows);
    } catch (err) {
        console.error('[LOC] GET all error:', err.message);
        res.status(500).json({ error: 'Failed to fetch locations.' });
    }
});

// ── GET single (public) ───────────────────────────────────────────────────────
router.get('/:id', validateId, (req, res) => {
    try {
        const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.validId);
        if (!row) return res.status(404).json({ error: 'Location not found.' });
        res.json(row);
    } catch (err) {
        console.error('[LOC] GET single error:', err.message);
        res.status(500).json({ error: 'Failed to fetch location.' });
    }
});

// ── POST — Add location (ADMIN ONLY) ─────────────────────────────────────────
router.post('/', authMiddleware, validateLocation, async (req, res) => {
    try {
        const { name, type, floor, building, description, lat, lng, panoramaUrl } = req.body;
        const result = db.prepare(
            'INSERT INTO locations (name, type, floor, building, description, lat, lng, panoramaUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(
            name.trim(), type.trim(),
            Number(floor) || 0, building.trim(),
            (description || '').trim().substring(0, 500),
            Number(lat) || 0, Number(lng) || 0,
            (panoramaUrl || '').trim()
        );
        const id = result.lastInsertRowid;
        const frontendUrl = process.env.FRONTEND_URL || 'https://spherewalk.luckyverse.tech';
        const qrData = `${frontendUrl}/ar-navigation?dest=${id}`;
        const qrCode = await QRCode.toDataURL(qrData);
        db.prepare('UPDATE locations SET qrCode = ? WHERE id = ?').run(qrCode, id);
        const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
        console.info(`[LOC] Added location "${name}" by admin "${req.admin.username}"`);
        res.status(201).json(location);
    } catch (err) {
        console.error('[LOC] POST error:', err.message);
        res.status(500).json({ error: 'Failed to add location.' });
    }
});

// ── PUT — Update location (ADMIN ONLY) ────────────────────────────────────────
router.put('/:id', authMiddleware, validateId, validateLocation, async (req, res) => {
    try {
        const { name, type, floor, building, description, lat, lng, isHidden, panoramaUrl } = req.body;
        const existing = db.prepare('SELECT id FROM locations WHERE id = ?').get(req.validId);
        if (!existing) return res.status(404).json({ error: 'Location not found.' });

        db.prepare(
            'UPDATE locations SET name=?, type=?, floor=?, building=?, description=?, lat=?, lng=?, isHidden=?, panoramaUrl=? WHERE id=?'
        ).run(
            name.trim(), type.trim(),
            Number(floor) || 0, building.trim(),
            (description || '').trim().substring(0, 500),
            Number(lat) || 0, Number(lng) || 0,
            isHidden ? 1 : 0,
            (panoramaUrl || '').trim(),
            req.validId
        );

        const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.validId);
        console.info(`[LOC] Updated location ID ${req.validId} by admin "${req.admin.username}"`);
        res.json(location);
    } catch (err) {
        console.error('[LOC] PUT error:', err.message);
        res.status(500).json({ error: 'Failed to update location.' });
    }
});

// ── DELETE (ADMIN ONLY) ───────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, validateId, (req, res) => {
    try {
        const existing = db.prepare('SELECT id FROM locations WHERE id = ?').get(req.validId);
        if (!existing) return res.status(404).json({ error: 'Location not found.' });
        db.prepare('DELETE FROM locations WHERE id = ?').run(req.validId);
        console.info(`[LOC] Deleted location ID ${req.validId} by admin "${req.admin.username}"`);
        res.json({ success: true });
    } catch (err) {
        console.error('[LOC] DELETE error:', err.message);
        res.status(500).json({ error: 'Failed to delete location.' });
    }
});

module.exports = router;