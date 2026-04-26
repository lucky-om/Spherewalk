/* Coded by Lucky */
/* SphereWalk Campus Explorer | Events Route */
const express       = require('express');
const authMiddleware = require('../middleware/auth');
const { validateEvent, validateId } = require('../middleware/validate');
const db            = require('../data/db');

const router = express.Router();

router.get('/', (req, res) => {
    try {
        res.json(db.prepare('SELECT * FROM events ORDER BY startTime ASC').all());
    } catch (err) { res.status(500).json({ error: 'Failed to fetch events.' }); }
});

router.get('/live', (req, res) => {
    try {
        res.json(db.prepare('SELECT * FROM events WHERE isLive = 1').all());
    } catch (err) { res.status(500).json({ error: 'Failed to fetch live events.' }); }
});

router.post('/', authMiddleware, validateEvent, (req, res) => {
    try {
        const { title, location, startTime, endTime, isLive, description } = req.body;
        const r = db.prepare(
            'INSERT INTO events (title, location, startTime, endTime, isLive, description) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(
            title.trim(), location.trim(), startTime.trim(), endTime.trim(),
            isLive ? 1 : 0, (description || '').trim().substring(0, 1000)
        );
        const evt = db.prepare('SELECT * FROM events WHERE id = ?').get(r.lastInsertRowid);
        console.info(`[EVT] Added event "${title}" by admin "${req.admin.username}"`);
        res.status(201).json(evt);
    } catch (err) {
        console.error('[EVT] POST error:', err.message);
        res.status(500).json({ error: 'Failed to add event.' });
    }
});

router.put('/:id', authMiddleware, validateId, validateEvent, (req, res) => {
    try {
        const { title, location, startTime, endTime, isLive, description } = req.body;
        const existing = db.prepare('SELECT id FROM events WHERE id = ?').get(req.validId);
        if (!existing) return res.status(404).json({ error: 'Event not found.' });
        db.prepare(
            'UPDATE events SET title=?, location=?, startTime=?, endTime=?, isLive=?, description=? WHERE id=?'
        ).run(
            title.trim(), location.trim(), startTime.trim(), endTime.trim(),
            isLive ? 1 : 0, (description || '').trim().substring(0, 1000), req.validId
        );
        res.json(db.prepare('SELECT * FROM events WHERE id = ?').get(req.validId));
    } catch (err) {
        console.error('[EVT] PUT error:', err.message);
        res.status(500).json({ error: 'Failed to update event.' });
    }
});

router.delete('/:id', authMiddleware, validateId, (req, res) => {
    try {
        const existing = db.prepare('SELECT id FROM events WHERE id = ?').get(req.validId);
        if (!existing) return res.status(404).json({ error: 'Event not found.' });
        db.prepare('DELETE FROM events WHERE id = ?').run(req.validId);
        console.info(`[EVT] Deleted event ID ${req.validId} by admin "${req.admin.username}"`);
        res.json({ success: true });
    } catch (err) {
        console.error('[EVT] DELETE error:', err.message);
        res.status(500).json({ error: 'Failed to delete event.' });
    }
});

module.exports = router;
