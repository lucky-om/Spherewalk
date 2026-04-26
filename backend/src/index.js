/* Coded by Lucky */
/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
require('dotenv').config();

// ── Guard: fail fast if critical secrets are missing ──────────────────────────
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set in environment variables. Refusing to start.');
    process.exit(1);
}
if (!process.env.GROK_API_KEY) {
    console.warn('[WARN] GROK_API_KEY is not set — AI chatbot will use local fallback only.');
}

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS: strict origin allowlist ─────────────────────────────────────────────
const ALLOWED_ORIGINS = (() => {
    const prod = process.env.FRONTEND_URL;
    const customDomains = ['https://spherewalk.luckyverse.tech', 'https://spherewalk.greennode.in'];
    return prod ? [prod, ...customDomains] : customDomains;
})();

app.use(cors({
    origin: (origin, cb) => {
        // Strict origin check for production
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
        console.warn(`[CORS] Blocked request from disallowed origin: ${origin}`);
        cb(new Error('CORS: origin not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
}));

// ── Request Logger ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        const level = res.statusCode >= 500 ? 'ERROR'
            : res.statusCode >= 400 ? 'WARN' : 'INFO';
        if (level !== 'INFO' || process.env.NODE_ENV !== 'production') {
            console.log(`[${level}] ${req.method} ${req.url} ${res.statusCode} ${ms}ms — IP:${req.ip}`);
        }
    });
    next();
});

// ── Global rate limit: 200 req / 15 min per IP ───────────────────────────────
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — please try again later.' },
}));

// ── Strict auth rate limit: 10 attempts / 15 min per IP ──────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts — please wait before trying again.' },
    handler: (req, res) => {
        console.warn(`[AUTH] Rate limit hit for IP: ${req.ip}`);
        res.status(429).json({ error: 'Too many login attempts — please wait before trying again.' });
    }
});

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Initialize DB (auto-seeds + migrations on first run) ─────────────────────
require('./data/db');

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authLimiter, require('./routes/auth'));
app.use('/api/locations',   require('./routes/locations'));
app.use('/api/events',      require('./routes/events'));
app.use('/api/tours',       require('./routes/tours'));
app.use('/api/analytics',   require('./routes/analytics'));
app.use('/api/qr',          require('./routes/qr'));
app.use('/api/chat',        require('./routes/chat'));
app.use('/api/campus-info', require('./routes/campusInfo')); // ← was missing!

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── 404 catch-all for unknown /api routes ─────────────────────────────────────
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// ── Global error handler (never expose stack traces to clients) ───────────────
app.use((err, req, res, _next) => {
    console.error('[SERVER ERROR]', err.message || err);
    if (err.message === 'CORS: origin not allowed') {
        return res.status(403).json({ error: 'CORS policy violation.' });
    }
    res.status(err.status || 500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Campus Explorer Backend → http://localhost:${PORT}`);
    console.log(`🔒 Security: helmet + rate-limiting + CORS active`);
    console.log(`🌐 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
