/* Coded by Lucky */
/* SphereWalk Campus Explorer | Auth Route */
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../data/db');

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // ── Input validation ────────────────────────────────────────────────
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }
        if (typeof username !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'Invalid input type.' });
        }
        if (username.length > 64 || password.length > 128) {
            return res.status(400).json({ error: 'Input too long.' });
        }

        const envAdminUser = process.env.ADMIN_USERNAME || 'admin';
        const envAdminPass = process.env.ADMIN_PASSWORD || 'admin123';

        // ── 1. Check Environment Variables First (plain-text compare) ───────
        if (username.trim() === envAdminUser && password === envAdminPass) {
            const token = jwt.sign(
                { id: 'env-admin', username: envAdminUser },
                JWT_SECRET,
                { expiresIn: '8h' }
            );
            console.info(`[AUTH] SUCCESS login (ENV) — username: "${envAdminUser}" IP: ${req.ip}`);
            return res.json({ token, username: envAdminUser });
        }

        // ── 2. Lookup admin in DB ───────────────────────────────────────────
        const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username.trim());

        // Always run bcrypt so response time doesn't reveal whether the user exists
        const DUMMY_HASH = '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
        const valid = bcrypt.compareSync(password, admin ? admin.password : DUMMY_HASH);

        if (!admin || !valid) {
            console.warn(`[AUTH] FAILED login — username: "${username.substring(0, 32)}" IP: ${req.ip}`);
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // ── Issue JWT (8-hour session) ──────────────────────────────────────
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        console.info(`[AUTH] SUCCESS login (DB) — username: "${admin.username}" IP: ${req.ip}`);
        res.json({ token, username: admin.username });

    } catch (err) {
        console.error('[AUTH] Login internal error:', err.message);
        res.status(500).json({ error: 'Authentication service error.' });
    }
});

module.exports = router;
