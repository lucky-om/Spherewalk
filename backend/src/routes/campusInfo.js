/* Coded by Lucky */
/* SphereWalk Campus Explorer | Campus Info Route */
const express       = require('express');
const router        = express.Router();
const authMiddleware = require('../middleware/auth');
const { validateCampusInfo, validateId } = require('../middleware/validate');
const db            = require('../data/db');

router.get('/', (req, res) => {
    try {
        res.json(db.prepare('SELECT * FROM campus_info ORDER BY category, title').all());
    } catch (err) { res.status(500).json({ error: 'Failed to fetch campus info.' }); }
});

router.post('/', authMiddleware, validateCampusInfo, (req, res) => {
    try {
        const { category, title, content } = req.body;
        const r = db.prepare(
            "INSERT INTO campus_info (category, title, content, updatedAt) VALUES (?, ?, ?, datetime('now'))"
        ).run(category.trim(), title.trim(), content.trim());
        const entry = db.prepare('SELECT * FROM campus_info WHERE id = ?').get(r.lastInsertRowid);
        console.info(`[INFO] Added knowledge entry "${title}" by admin "${req.admin.username}"`);
        res.status(201).json(entry);
    } catch (err) {
        console.error('[INFO] POST error:', err.message);
        res.status(500).json({ error: 'Failed to add campus info.' });
    }
});

router.put('/:id', authMiddleware, validateId, validateCampusInfo, (req, res) => {
    try {
        const { category, title, content } = req.body;
        const existing = db.prepare('SELECT id FROM campus_info WHERE id = ?').get(req.validId);
        if (!existing) return res.status(404).json({ error: 'Entry not found.' });
        db.prepare(
            "UPDATE campus_info SET category=?, title=?, content=?, updatedAt=datetime('now') WHERE id=?"
        ).run(category.trim(), title.trim(), content.trim(), req.validId);
        res.json(db.prepare('SELECT * FROM campus_info WHERE id = ?').get(req.validId));
    } catch (err) {
        console.error('[INFO] PUT error:', err.message);
        res.status(500).json({ error: 'Failed to update campus info.' });
    }
});

router.delete('/:id', authMiddleware, validateId, (req, res) => {
    try {
        const existing = db.prepare('SELECT id FROM campus_info WHERE id = ?').get(req.validId);
        if (!existing) return res.status(404).json({ error: 'Entry not found.' });
        db.prepare('DELETE FROM campus_info WHERE id = ?').run(req.validId);
        console.info(`[INFO] Deleted knowledge entry ID ${req.validId} by admin "${req.admin.username}"`);
        res.json({ success: true });
    } catch (err) {
        console.error('[INFO] DELETE error:', err.message);
        res.status(500).json({ error: 'Failed to delete campus info.' });
    }
});

module.exports = router;
