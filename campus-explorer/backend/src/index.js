const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize DB (auto-seeds on first run)
require('./data/db');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/events', require('./routes/events'));
app.use('/api/tours', require('./routes/tours'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/chat', require('./routes/chat'));
// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(PORT, () => {
    console.log(`🚀 Campus Explorer Backend → http://localhost:${PORT}`);
});
