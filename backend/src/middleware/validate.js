/* Coded by Lucky */
/* SphereWalk Campus Explorer | Input Validation Middleware */

const ALLOWED_LOCATION_TYPES = ['lab', 'office', 'facility', 'parking', 'classroom', 'restroom', 'other'];
const ALLOWED_TOUR_LEVELS    = ['campus', 'department', 'room'];
const ALLOWED_INFO_CATEGORIES = [
    'General', 'Facilities', 'Academic', 'Staff', 'Rules',
    'Events', 'Other', 'Admissions', 'Fees', 'Placements', 'Academic Rules'
];


// ── Primitive validators ──────────────────────────────────────────────────────
const requireStr = (val, name, min = 1, max = 255) => {
    if (val === undefined || val === null) return `${name} is required.`;
    if (typeof val !== 'string') return `${name} must be a string.`;
    if (val.trim().length < min) return `${name} must be at least ${min} character(s).`;
    if (val.trim().length > max) return `${name} cannot exceed ${max} characters.`;
    return null;
};

const requireIntRange = (val, name, min = 0, max = 999) => {
    const n = Number(val);
    if (Number.isNaN(n) || !Number.isInteger(n)) return `${name} must be a whole number.`;
    if (n < min || n > max) return `${name} must be between ${min} and ${max}.`;
    return null;
};

// ── Middleware factories ──────────────────────────────────────────────────────
const validateId = (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid resource ID.' });
    }
    req.validId = id;
    next();
};

const validateLocation = (req, res, next) => {
    const { name, type, floor, building } = req.body;
    const errs = [
        requireStr(name, 'name', 2, 100),
        requireStr(type, 'type', 2, 50),
        requireStr(building, 'building', 2, 100),
        requireIntRange(floor !== undefined ? floor : 0, 'floor', 0, 50),
    ].filter(Boolean);
    if (type && !ALLOWED_LOCATION_TYPES.includes(type)) {
        errs.push(`type must be one of: ${ALLOWED_LOCATION_TYPES.join(', ')}.`);
    }
    if (errs.length) return res.status(400).json({ error: errs[0] });
    next();
};

const validateEvent = (req, res, next) => {
    const { title, location, startTime, endTime } = req.body;
    const errs = [
        requireStr(title, 'title', 2, 150),
        requireStr(location, 'location', 2, 150),
        requireStr(startTime, 'startTime', 5, 50),
        requireStr(endTime, 'endTime', 5, 50),
    ].filter(Boolean);
    if (!errs.length && new Date(startTime) >= new Date(endTime)) {
        errs.push('endTime must be after startTime.');
    }
    if (errs.length) return res.status(400).json({ error: errs[0] });
    next();
};

const validateCampusInfo = (req, res, next) => {
    const { category, title, content } = req.body;
    const errs = [
        requireStr(category, 'category', 2, 50),
        requireStr(title, 'title', 2, 200),
        requireStr(content, 'content', 2, 5000),
    ].filter(Boolean);
    if (category && !ALLOWED_INFO_CATEGORIES.includes(category.trim())) {
        errs.push(`category must be one of: ${ALLOWED_INFO_CATEGORIES.join(', ')}.`);
    }
    if (errs.length) return res.status(400).json({ error: errs[0] });
    next();
};

const validateTour = (req, res, next) => {
    const { name, level } = req.body;
    const errs = [
        requireStr(name, 'name', 2, 150),
        requireStr(level, 'level', 2, 50),
    ].filter(Boolean);
    if (level && !ALLOWED_TOUR_LEVELS.includes(level)) {
        errs.push(`level must be one of: ${ALLOWED_TOUR_LEVELS.join(', ')}.`);
    }
    if (errs.length) return res.status(400).json({ error: errs[0] });
    next();
};

const validateChat = (req, res, next) => {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages must be a non-empty array.' });
    }
    if (messages.length > 20) {
        return res.status(400).json({ error: 'Too many messages in history (max 20).' });
    }
    for (const m of messages) {
        if (!m || typeof m.text !== 'string' || m.text.trim().length === 0) {
            return res.status(400).json({ error: 'Each message must have a non-empty text field.' });
        }
        if (m.text.length > 2000) {
            return res.status(400).json({ error: 'Message text cannot exceed 2000 characters.' });
        }
    }
    next();
};

module.exports = {
    validateId, validateLocation, validateEvent,
    validateCampusInfo, validateTour, validateChat,
    ALLOWED_LOCATION_TYPES, ALLOWED_INFO_CATEGORIES
};
