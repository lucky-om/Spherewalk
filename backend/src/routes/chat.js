/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
/* Coded by Lucky */
const express   = require('express');
const rateLimit = require('express-rate-limit');
const router    = express.Router();
const { validateChat } = require('../middleware/validate');
const db        = require('../data/db');

// AI rate limiter — 5 requests per minute per IP (prevent cost abuse)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'AI rate limit reached. Please wait before sending another message.' },
});

const SYSTEM_INSTRUCTION = `You are the Lead Campus Concierge for the SphereWalk Virtual Campus Explorer.

CONTEXT: You provide information about the SCET (Sarvajanik College of Engineering and Technology) campus. 

PRECISION RULES:
- ONLY answer the specific question asked. Do not dump unrelated staff or location info.
- Use Markdown: **bolding** and bullet points.
- If the question is about a location, provide clear directions and details.
- If the information is missing, say: "❌ I don't have that specific information in my records."`;

// --- Intent Detection Logic ---
function detectIntent(query) {
    const lq = query.toLowerCase();
    
    if (/(emergency|sos|help|ambulance|security|fire|medical|police)/.test(lq)) return 'EMERGENCY';
    if (/(event|fest|techfest|seminar|lecture|happening|celebration)/.test(lq)) return 'EVENT';
    // FEE must be checked before ADMISSION since fee questions are specific
    if (/(fee|fees|tuition|cost|how much|payment|scholarship|waiver|stipend)/.test(lq)) return 'FEE';
    if (/(admission|apply|eligible|eligibility|requirement|document|cutoff|cet|jee|cap round)/.test(lq)) return 'ADMISSION';
    if (/(placement|package|lpa|recruit|campus drive|hire|job|internship)/.test(lq)) return 'PLACEMENT';
    if (/(hod|staff|professor|principal|faculty|registrar|teacher|dean|librarian)/.test(lq)) return 'STAFF';
    if (/(where|location|room|lab|office|find|building|block|place|floor|direction|navigate)/.test(lq)) return 'LOCATION';
    
    return 'GENERAL';
}

function robustSearch(query, locations, events, campusInfo) {
    const lq = query.toLowerCase().trim();
    const intent = detectIntent(lq);
    
    // 1. Initial Greetings
    if (/^(hi|hello|hey|welcome)/.test(lq) && lq.length < 10) {
        return "👋 **Welcome to SphereWalk!** I'm your AI Campus Guide.\n\nAsk me about:\n- 📍 **Locations** & Navigation\n- 👥 **Staff** & Faculty\n- 📅 **Events** & Admissions";
    }

    if (intent === 'EMERGENCY') {
        return "🚨 **Emergency Contacts**\n- **Security**: 9876500001\n- **Medical**: 9876500002\n- **Ambulance**: 108\n\nPlease stay calm. Help is available.";
    }

    let response = "";

    // 2. Intent-Based Categorized Search

    // FEE queries — look specifically in Fees category first
    if (intent === 'FEE') {
        const feeEntries = campusInfo.filter(i => i.category === 'Fees');
        if (feeEntries.length) {
            // Try to find a close match, else return all fee info
            const match = feeEntries.find(a => lq.split(' ').some(w => w.length > 3 && a.title.toLowerCase().includes(w)));
            const toShow = match ? [match] : feeEntries.slice(0, 2);
            response = `### 💰 Fee Information\n\n`;
            toShow.forEach(f => response += `**${f.title}**\n${f.content}\n\n`);
        }
    }

    // ADMISSION queries
    if (intent === 'ADMISSION') {
        const admEntries = campusInfo.filter(i => i.category === 'Admissions');
        const match = admEntries.find(a => lq.split(' ').some(w => w.length > 3 && a.title.toLowerCase().includes(w)));
        const toShow = match ? [match] : admEntries.slice(0, 2);
        if (toShow.length) {
            response = `### 🎓 Admission Information\n\n`;
            toShow.forEach(a => response += `**${a.title}**\n${a.content}\n\n`);
        }
    }

    // PLACEMENT queries
    if (intent === 'PLACEMENT') {
        const plc = campusInfo.filter(i => i.category === 'Placements');
        if (plc.length) {
            response = `### 💼 Placement Statistics\n\n`;
            plc.slice(0, 2).forEach(p => response += `**${p.title}**\n${p.content}\n\n`);
        }
    }

    // STAFF queries
    if (intent === 'STAFF' && !response) {
        const words = lq.split(' ').filter(w => w.length > 3);
        const staff = campusInfo.filter(i => {
            if (i.category !== 'Staff') return false;
            const contentLower = i.content.toLowerCase();
            const titleLower = i.title.toLowerCase();
            return words.some(w => titleLower.includes(w) || contentLower.includes(w)) ||
                   lq.includes('hod') || lq.includes('staff') || lq.includes('faculty');
        });
        if (staff.length) {
            response = `### 👥 Staff Information\n\n`;
            staff.slice(0, 3).forEach(s => response += `**${s.title}**\n${s.content}\n\n`);
        }
    }

    // EVENT queries
    if (intent === 'EVENT' && !response) {
        if (events.length) {
            response = `### 📅 Upcoming Events\n\n`;
            events.slice(0, 3).forEach(e => {
                response += `- **${e.title}**\n  📍 Location: ${e.location}\n  📝 ${e.description}\n\n`;
            });
        }
    }

    // LOCATION queries
    if ((intent === 'LOCATION' || (intent === 'GENERAL' && !response))) {
        const locMatches = locations.filter(l => {
            const words = lq.split(' ');
            return words.some(w => w.length > 3 && l.name.toLowerCase().includes(w));
        });
        if (locMatches.length) {
            response = `### 📍 Location Details\n\n`;
            locMatches.slice(0, 2).forEach(l => {
                response += `**${l.name}**\n- **Building**: ${l.building}\n- **Floor**: ${l.floor === 0 ? 'Ground' : 'Floor ' + l.floor}\n- **Info**: ${l.description || 'Campus facility'}\n\n`;
            });
            response += `*Use the navigation button below for AR directions.*`;
        }
    }

    // GENERAL fallback — search all campus info by keyword
    if (!response) {
        const words = lq.split(' ').filter(w => w.length > 3);
        const matched = campusInfo.find(i =>
            words.some(w => i.title.toLowerCase().includes(w) || i.content.toLowerCase().includes(w))
        );
        if (matched) {
            response = `### 📋 ${matched.title}\n\n${matched.content}`;
        }
    }

    if (response) return response.trim();
    return "❌ I don't have that specific information in my records. Please try asking about fees, admission, locations, or staff.";
}

const BUILDING_TO_BLOCK = {
    'cs block': 'block_c', 'computer engineering': 'block_c', 'it block': 'block_h',
    'library': 'block_d', 'admin block': 'block_a', 'chemical block': 'block_ij',
    'auditorium': 'center_stage', 'mca': 'block_c', 'canteen': 'canteen_area'
};

const AR_DEST_MAP = [
    { keywords: ['computer lab', 'programming lab'], destId: 'cs-lab', label: 'Computer Lab' },
    { keywords: ['library'], destId: 'library', label: 'Library' },
    { keywords: ['canteen'], destId: 'canteen', label: 'Canteen' },
    { keywords: ['auditorium', 'seminar hall'], destId: 'auditorium', label: 'Auditorium' },
    { keywords: ['parking'], destId: 'parking', label: 'Parking' },
    { keywords: ['admin office', 'principal'], destId: 'admin', label: 'Admin Office' },
];

function buildActions(userMessage, locations) {
    const lq = userMessage.toLowerCase();
    const actions = [];
    
    if (lq.includes('help') || lq.includes('emergency')) {
        actions.push({ label: '🆘 SOS Contacts', route: '/emergency' });
    }

    const matchedLoc = locations.find(l => {
        const words = lq.split(' ');
        return words.some(w => w.length > 3 && l.name.toLowerCase().includes(w));
    });

    if (matchedLoc) {
        const bl = matchedLoc.building.toLowerCase();
        let blockId = null;
        for (const [k, v] of Object.entries(BUILDING_TO_BLOCK)) { if (bl.includes(k)) blockId = v; }
        
        const arDest = AR_DEST_MAP.find(d => d.keywords.some(k => matchedLoc.name.toLowerCase().includes(k) || lq.includes(k)));

        actions.push({ label: `📍 Map: ${matchedLoc.name}`, route: '/campus-map', query: matchedLoc.name, building: blockId });
        if (arDest) {
            actions.push({ label: `🧭 Navigate to ${matchedLoc.name}`, route: '/ar-navigation', dest: arDest.destId, destLabel: matchedLoc.name });
        }
    }

    return actions;
}

router.post('/', aiLimiter, validateChat, async (req, res) => {
    try {
        const { messages } = req.body;

        const locations = db.prepare('SELECT name, type, building, floor, description FROM locations LIMIT 60').all();
        const events = db.prepare('SELECT title, location, startTime, isLive, description FROM events LIMIT 10').all();
        const campusInfo = db.prepare('SELECT category, title, content FROM campus_info LIMIT 60').all();

        const userMessage = messages[messages.length - 1].text;
        const intent = detectIntent(userMessage);

        // Precision Filtering for AI Context
        let contextInfo = campusInfo;
        let contextLocs = locations;

        if (intent === 'STAFF')     contextInfo = campusInfo.filter(i => i.category === 'Staff');
        if (intent === 'FEE')       contextInfo = campusInfo.filter(i => i.category === 'Fees');
        if (intent === 'ADMISSION') contextInfo = campusInfo.filter(i => i.category === 'Admissions');
        if (intent === 'PLACEMENT') contextInfo = campusInfo.filter(i => i.category === 'Placements');
        if (intent === 'LOCATION')  contextLocs = locations.filter(l => userMessage.toLowerCase().split(' ').some(w => w.length > 3 && l.name.toLowerCase().includes(w)));

        const ragContext = `
### 👥 STAFF
${contextInfo.map(i => `- **${i.title}**: ${i.content}`).join('\n')}

### 📍 LOCATIONS
${contextLocs.map(l => `- **${l.name}** (${l.building}, Floor ${l.floor}): ${l.description || ''}`).join('\n')}

### 📅 EVENTS
[Current Time: ${new Date().toLocaleString()}]
${events.map(e => `- **${e.title}** @ ${e.location}: ${e.description} (Live: ${e.isLive ? 'YES' : 'NO'}, Time: ${e.startTime})`).join('\n')}
        `.trim();

        const actions = buildActions(userMessage, locations);

        try {
            const apiMessages = [
                { role: 'system', content: SYSTEM_INSTRUCTION + '\n\n[DATABASE CONTEXT]\n' + ragContext }
            ];
            
            // Format history for Grok API
            messages.forEach(m => {
                apiMessages.push({
                    role: m.role === 'bot' ? 'assistant' : 'user',
                    content: m.text
                });
            });

            const apiKey = process.env.GROK_API_KEY || '';
            if (!apiKey) throw new Error("GROK_API_KEY is not set.");

            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'grok-beta',
                    messages: apiMessages,
                    temperature: 0.5
                })
            });

            if (!response.ok) {
                const errData = await response.text();
                throw new Error(`Grok API error: ${response.status} ${errData}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content || "";
            return res.json({ reply: aiResponse, actions, source: 'ai' });

        } catch (aiError) {
            console.error('AI Error, using fallback:', aiError.message);
            const fallback = robustSearch(userMessage, locations, events, campusInfo);
            return res.json({ reply: fallback, actions, source: 'local' });
        }
    } catch (err) {
        console.error('[CHAT] Internal error:', err.message);
        res.status(500).json({ error: 'Chat service encountered an error.' });
    }
});

module.exports = router;
