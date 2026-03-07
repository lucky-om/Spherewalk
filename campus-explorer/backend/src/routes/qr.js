const express = require('express');
const QRCode = require('qrcode');
const db = require('../data/db');

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(Number(req.params.id));
        if (!location) return res.status(404).json({ error: 'Location not found' });
        const qrData = `http://localhost:5173/ar-navigation?dest=${location.id}`;
        const qrBuffer = await QRCode.toBuffer(qrData, { width: 300, margin: 2 });
        res.setHeader('Content-Type', 'image/png');
        res.send(qrBuffer);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
