/* Coded by Lucky */
/* SphereWalk Campus Explorer | Security Layer */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET env variable is not set. Server will not start without it.');
}

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        console.warn(`[AUTH] Token verification failed from IP ${req.ip}: ${err.message}`);
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = authMiddleware;
