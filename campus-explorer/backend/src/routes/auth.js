const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/db');

const router = express.Router();

router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
        if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
        const valid = bcrypt.compareSync(password, admin.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: admin.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
