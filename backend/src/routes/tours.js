/* Coded by Lucky */
/* SphereWalk Campus Explorer | Tours Route */
const express       = require('express');
const multer        = require('multer');
const path          = require('path');
const authMiddleware = require('../middleware/auth');
const { validateTour, validateId } = require('../middleware/validate');
const db            = require('../data/db');

const router = express.Router();

// ── Secure file upload config ─────────────────────────────────────────────────
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB  = 8;

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        // Sanitize: keep only alphanumeric extension, prepend timestamp
        const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
        cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Only image uploads are allowed (jpeg, png, webp, gif). Got: ${file.mimetype}`));
        }
    }
});

// Handle multer errors cleanly
const uploadSingle = (req, res, next) => {
    upload.single('panorama')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

router.get('/', (req, res) => {
    try {
        res.json(db.prepare('SELECT * FROM tour_spaces ORDER BY `order` ASC').all());
    } catch (err) { res.status(500).json({ error: 'Failed to fetch tours.' }); }
});

router.post('/', authMiddleware, uploadSingle, validateTour, (req, res) => {
    try {
        const { name, parentId, level, hotspots, order, panoramaUrl: bodyUrl } = req.body;
        const panoramaUrl = req.file ? `/uploads/${req.file.filename}` : (bodyUrl || '');

        // Validate hotspots JSON
        let parsedHotspots = '[]';
        if (hotspots) {
            try { JSON.parse(hotspots); parsedHotspots = hotspots; }
            catch { return res.status(400).json({ error: 'hotspots must be valid JSON.' }); }
        }

        const r = db.prepare(
            'INSERT INTO tour_spaces (name, parentId, level, panoramaUrl, hotspots, `order`) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(name.trim(), parentId ? Number(parentId) : null, level.trim(), panoramaUrl, parsedHotspots, Number(order) || 0);
        res.status(201).json(db.prepare('SELECT * FROM tour_spaces WHERE id = ?').get(r.lastInsertRowid));
    } catch (err) {
        console.error('[TOUR] POST error:', err.message);
        res.status(500).json({ error: 'Failed to add tour space.' });
    }
});

router.put('/:id', authMiddleware, validateId, uploadSingle, validateTour, (req, res) => {
    try {
        const { name, parentId, level, hotspots, order, panoramaUrl: bodyUrl } = req.body;
        const existing = db.prepare('SELECT id FROM tour_spaces WHERE id = ?').get(req.validId);
        if (!existing) return res.status(404).json({ error: 'Tour space not found.' });

        const panoramaUrl = req.file ? `/uploads/${req.file.filename}` : (bodyUrl || '');
        let parsedHotspots = '[]';
        if (hotspots) {
            try { JSON.parse(hotspots); parsedHotspots = hotspots; }
            catch { return res.status(400).json({ error: 'hotspots must be valid JSON.' }); }
        }

        db.prepare(
            'UPDATE tour_spaces SET name=?, parentId=?, level=?, panoramaUrl=?, hotspots=?, `order`=? WHERE id=?'
        ).run(name.trim(), parentId ? Number(parentId) : null, level.trim(), panoramaUrl, parsedHotspots, Number(order) || 0, req.validId);
        res.json(db.prepare('SELECT * FROM tour_spaces WHERE id = ?').get(req.validId));
    } catch (err) {
        console.error('[TOUR] PUT error:', err.message);
        res.status(500).json({ error: 'Failed to update tour space.' });
    }
});

router.delete('/:id', authMiddleware, validateId, (req, res) => {
    try {
        const existing = db.prepare('SELECT id FROM tour_spaces WHERE id = ?').get(req.validId);
        if (!existing) return res.status(404).json({ error: 'Tour space not found.' });
        db.prepare('DELETE FROM tour_spaces WHERE id = ?').run(req.validId);
        res.json({ success: true });
    } catch (err) {
        console.error('[TOUR] DELETE error:', err.message);
        res.status(500).json({ error: 'Failed to delete tour space.' });
    }
});

module.exports = router;
