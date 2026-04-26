/* Coded by Lucky */
/* SphereWalk Campus Explorer | v1.0 | Green Node Team */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../campus.db');
const db = new Database(DB_PATH);

console.log('--- Cleaning Duplicate Locations ---');

try {
    const locations = db.prepare('SELECT * FROM locations').all();
    const seen = new Set();
    const toDelete = [];

    // Simple deduplication: Keep the first one found (usually the more detailed one from first seed)
    for (const loc of locations) {
        const normalized = loc.name.toLowerCase().trim();
        if (seen.has(normalized)) {
            toDelete.push(loc.id);
        } else {
            seen.add(normalized);
        }
    }

    if (toDelete.length > 0) {
        const deleteStmt = db.prepare('DELETE FROM locations WHERE id IN (' + toDelete.join(',') + ')');
        const info = deleteStmt.run();
        console.log(`✅ Removed ${info.changes} duplicate location(s).`);
    } else {
        console.log('✅ No duplicates found in locations table.');
    }

} catch (err) {
    console.error('❌ Error cleaning database:', err.message);
}

db.close();
