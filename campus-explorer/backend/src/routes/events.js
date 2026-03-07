const express = require('express');
const authMiddleware = require('../middleware/auth');
const db = require('../data/db');

const router = express.Router();

router.get('/', (req, res) => {
    try {
        res.json(db.prepare('SELECT * FROM events ORDER BY startTime ASC').all());
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/live', (req, res) => {
    try {
        res.json(db.prepare('SELECT * FROM events WHERE isLive = 1').all());
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, (req, res) => {
    try {
        const { title, location, startTime, endTime, isLive, description } = req.body;
        const r = db.prepare(
            'INSERT INTO events (title, location, startTime, endTime, isLive, description) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(title, location, startTime, endTime, isLive ? 1 : 0, description || '');
        res.status(201).json(db.prepare('SELECT * FROM events WHERE id = ?').get(r.lastInsertRowid));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authMiddleware, (req, res) => {
    try {
        const { title, location, startTime, endTime, isLive, description } = req.body;
        db.prepare(
            'UPDATE events SET title=?, location=?, startTime=?, endTime=?, isLive=?, description=? WHERE id=?'
        ).run(title, location, startTime, endTime, isLive ? 1 : 0, description || '', Number(req.params.id));
        res.json(db.prepare('SELECT * FROM events WHERE id = ?').get(Number(req.params.id)));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM events WHERE id = ?').run(Number(req.params.id));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
