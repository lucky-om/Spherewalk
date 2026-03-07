const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const db = require('../data/db');

const router = express.Router();
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', (req, res) => {
    try {
        res.json(db.prepare('SELECT * FROM tour_spaces ORDER BY `order` ASC').all());
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, upload.single('panorama'), (req, res) => {
    try {
        const { name, parentId, level, hotspots, order, panoramaUrl: bodyUrl } = req.body;
        const panoramaUrl = req.file ? `/uploads/${req.file.filename}` : (bodyUrl || '');
        const r = db.prepare(
            'INSERT INTO tour_spaces (name, parentId, level, panoramaUrl, hotspots, `order`) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(name, parentId ? Number(parentId) : null, level, panoramaUrl, hotspots || '[]', Number(order) || 0);
        res.status(201).json(db.prepare('SELECT * FROM tour_spaces WHERE id = ?').get(r.lastInsertRowid));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authMiddleware, upload.single('panorama'), (req, res) => {
    try {
        const { name, parentId, level, hotspots, order, panoramaUrl: bodyUrl } = req.body;
        const panoramaUrl = req.file ? `/uploads/${req.file.filename}` : (bodyUrl || '');
        db.prepare(
            'UPDATE tour_spaces SET name=?, parentId=?, level=?, panoramaUrl=?, hotspots=?, `order`=? WHERE id=?'
        ).run(name, parentId ? Number(parentId) : null, level, panoramaUrl, hotspots || '[]', Number(order) || 0, Number(req.params.id));
        res.json(db.prepare('SELECT * FROM tour_spaces WHERE id = ?').get(Number(req.params.id)));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authMiddleware, (req, res) => {
    try {
        db.prepare('DELETE FROM tour_spaces WHERE id = ?').run(Number(req.params.id));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
