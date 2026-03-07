const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const db = require('../data/db');

// GET all campus info entries
router.get('/', (req, res) => {
    try {
        res.json(db.prepare('SELECT * FROM campus_info ORDER BY category, title').all());
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — add new info entry (admin only)
router.post('/', authMiddleware, (req, res) => {
    try {
        const { category, title, content } = req.body;
        if (!category || !title || !content) return res.status(400).json({ error: 'category, title and content are required.' });
        const r = db.prepare(
            "INSERT INTO campus_info (category, title, content, updatedAt) VALUES (?, ?, ?, datetime('now'))"
        ).run(category.trim(), title.trim(), content.trim());
        res.status(201).json(db.prepare('SELECT * FROM campus_info WHERE id = ?').get(r.lastInsertRowid));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT — update existing entry (admin only)
router.put('/:id', authMiddleware, (req, res) => {
    try {
        const { category, title, content } = req.body;
        db.prepare(
            "UPDATE campus_info SET category=?, title=?, content=?, updatedAt=datetime('now') WHERE id=?"
        ).run(category.trim(), title.trim(), content.trim(), Number(req.params.id));
        res.json(db.prepare('SELECT * FROM campus_info WHERE id = ?').get(Number(req.params.id)));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM campus_info WHERE id = ?').run(Number(req.params.id));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
