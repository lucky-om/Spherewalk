// ─── CAMPUS NAVIGATION GRAPH ──────────────────────────────────────────────────
// Node types: 'building_entry' | 'building_exit' | 'stairs' | 'corridor' | 'room' | 'outdoor'
// Each node maps to a position on the 2D SVG (viewBox: 0 0 600 450)

export const NODES = {
    // ── OUTDOOR / CAMPUS PATHS ──────────────────────────────────────────────
    outdoor_center: { id: 'outdoor_center', type: 'outdoor', label: 'Campus Center', x: 300, y: 230, building: null },
    outdoor_top: { id: 'outdoor_top', type: 'outdoor', label: 'Top Corridor', x: 300, y: 140, building: null },
    outdoor_right: { id: 'outdoor_right', type: 'outdoor', label: 'Right Corridor', x: 450, y: 230, building: null },
    outdoor_bottom: { id: 'outdoor_bottom', type: 'outdoor', label: 'Bottom Corridor', x: 300, y: 320, building: null },
    outdoor_left: { id: 'outdoor_left', type: 'outdoor', label: 'Left Corridor', x: 110, y: 230, building: null },
    outdoor_ne: { id: 'outdoor_ne', type: 'outdoor', label: 'NE Junction', x: 450, y: 140, building: null },
    outdoor_nw: { id: 'outdoor_nw', type: 'outdoor', label: 'NW Junction', x: 110, y: 140, building: null },

    // ── BLOCK A (Admin) ─────────────────────────────────────────────────────
    'block_a_exit': { id: 'block_a_exit', type: 'building_exit', label: 'Block A Exit', x: 105, y: 120, building: 'block_a' },
    'block_a_entry': { id: 'block_a_entry', type: 'building_entry', label: 'Block A Entry', x: 105, y: 120, building: 'block_a' },
    'block_a_stairs': { id: 'block_a_stairs', type: 'stairs', label: 'Block A Stairs', x: 115, y: 90, building: 'block_a' },
    'block_a_gf': { id: 'block_a_gf', type: 'room', label: 'Block A Ground Floor', x: 105, y: 85, building: 'block_a', floor: 0 },
    'block_a_1f': { id: 'block_a_1f', type: 'room', label: 'Block A 1st Floor', x: 105, y: 85, building: 'block_a', floor: 1 },
    'block_a_2f': { id: 'block_a_2f', type: 'room', label: 'Block A 2nd Floor', x: 105, y: 85, building: 'block_a', floor: 2 },

    // ── BLOCK B (Architecture) ──────────────────────────────────────────────
    'block_b_exit': { id: 'block_b_exit', type: 'building_exit', label: 'Block B Exit', x: 210, y: 120, building: 'block_b' },
    'block_b_entry': { id: 'block_b_entry', type: 'building_entry', label: 'Block B Entry', x: 210, y: 120, building: 'block_b' },
    'block_b_stairs': { id: 'block_b_stairs', type: 'stairs', label: 'Block B Stairs', x: 210, y: 90, building: 'block_b' },
    'block_b_gf': { id: 'block_b_gf', type: 'room', label: 'Block B Ground Floor', x: 210, y: 85, building: 'block_b', floor: 0 },
    'block_b_1f': { id: 'block_b_1f', type: 'room', label: 'Block B 1st Floor', x: 210, y: 85, building: 'block_b', floor: 1 },
    'block_b_2f': { id: 'block_b_2f', type: 'room', label: 'Block B 2nd Floor', x: 210, y: 85, building: 'block_b', floor: 2 },

    // ── BLOCK C (CS) ────────────────────────────────────────────────────────
    'block_c_exit': { id: 'block_c_exit', type: 'building_exit', label: 'Block C Exit', x: 315, y: 120, building: 'block_c' },
    'block_c_entry': { id: 'block_c_entry', type: 'building_entry', label: 'Block C Entry', x: 315, y: 120, building: 'block_c' },
    'block_c_stairs': { id: 'block_c_stairs', type: 'stairs', label: 'Block C Stairs', x: 315, y: 90, building: 'block_c' },
    'block_c_gf': { id: 'block_c_gf', type: 'room', label: 'Block C Ground Floor', x: 315, y: 85, building: 'block_c', floor: 0 },
    'block_c_1f': { id: 'block_c_1f', type: 'room', label: 'Block C 1st Floor', x: 315, y: 85, building: 'block_c', floor: 1 },
    'block_c_2f': { id: 'block_c_2f', type: 'room', label: 'Block C 2nd Floor', x: 315, y: 85, building: 'block_c', floor: 2 },

    // ── BLOCK D (Library) ───────────────────────────────────────────────────
    'block_d_exit': { id: 'block_d_exit', type: 'building_exit', label: 'Block D Exit', x: 415, y: 120, building: 'block_d' },
    'block_d_entry': { id: 'block_d_entry', type: 'building_entry', label: 'Block D Entry', x: 415, y: 120, building: 'block_d' },
    'block_d_stairs': { id: 'block_d_stairs', type: 'stairs', label: 'Block D Stairs', x: 415, y: 90, building: 'block_d' },
    'block_d_gf': { id: 'block_d_gf', type: 'room', label: 'Block D Ground Floor', x: 415, y: 85, building: 'block_d', floor: 0 },
    'block_d_1f': { id: 'block_d_1f', type: 'room', label: 'Block D 1st Floor', x: 415, y: 85, building: 'block_d', floor: 1 },

    // ── BLOCK E (Electrical) ────────────────────────────────────────────────
    'block_e_exit': { id: 'block_e_exit', type: 'building_exit', label: 'Block E Exit', x: 510, y: 85, building: 'block_e' },
    'block_e_entry': { id: 'block_e_entry', type: 'building_entry', label: 'Block E Entry', x: 510, y: 85, building: 'block_e' },
    'block_e_stairs': { id: 'block_e_stairs', type: 'stairs', label: 'Block E Stairs', x: 510, y: 70, building: 'block_e' },
    'block_e_gf': { id: 'block_e_gf', type: 'room', label: 'Block E Ground Floor', x: 510, y: 65, building: 'block_e', floor: 0 },
    'block_e_1f': { id: 'block_e_1f', type: 'room', label: 'Block E 1st Floor', x: 510, y: 65, building: 'block_e', floor: 1 },
    'block_e_2f': { id: 'block_e_2f', type: 'room', label: 'Block E 2nd Floor', x: 510, y: 65, building: 'block_e', floor: 2 },

    // ── BLOCK F (E&C) ────────────────────────────────────────────────────────
    'block_f_exit': { id: 'block_f_exit', type: 'building_exit', label: 'Block F Exit', x: 510, y: 180, building: 'block_f' },
    'block_f_entry': { id: 'block_f_entry', type: 'building_entry', label: 'Block F Entry', x: 510, y: 180, building: 'block_f' },
    'block_f_stairs': { id: 'block_f_stairs', type: 'stairs', label: 'Block F Stairs', x: 510, y: 160, building: 'block_f' },
    'block_f_gf': { id: 'block_f_gf', type: 'room', label: 'Block F Ground Floor', x: 510, y: 155, building: 'block_f', floor: 0 },
    'block_f_1f': { id: 'block_f_1f', type: 'room', label: 'Block F 1st Floor', x: 510, y: 155, building: 'block_f', floor: 1 },
    'block_f_2f': { id: 'block_f_2f', type: 'room', label: 'Block F 2nd Floor', x: 510, y: 155, building: 'block_f', floor: 2 },

    // ── BLOCK G (IC) ────────────────────────────────────────────────────────
    'block_g_exit': { id: 'block_g_exit', type: 'building_exit', label: 'Block G Exit', x: 510, y: 275, building: 'block_g' },
    'block_g_entry': { id: 'block_g_entry', type: 'building_entry', label: 'Block G Entry', x: 510, y: 275, building: 'block_g' },
    'block_g_stairs': { id: 'block_g_stairs', type: 'stairs', label: 'Block G Stairs', x: 510, y: 255, building: 'block_g' },
    'block_g_gf': { id: 'block_g_gf', type: 'room', label: 'Block G Ground Floor', x: 510, y: 250, building: 'block_g', floor: 0 },
    'block_g_1f': { id: 'block_g_1f', type: 'room', label: 'Block G 1st Floor', x: 510, y: 250, building: 'block_g', floor: 1 },
    'block_g_2f': { id: 'block_g_2f', type: 'room', label: 'Block G 2nd Floor', x: 510, y: 250, building: 'block_g', floor: 2 },

    // ── BLOCK H (IT) ────────────────────────────────────────────────────────
    'block_h_exit': { id: 'block_h_exit', type: 'building_exit', label: 'Block H Exit', x: 510, y: 370, building: 'block_h' },
    'block_h_entry': { id: 'block_h_entry', type: 'building_entry', label: 'Block H Entry', x: 510, y: 370, building: 'block_h' },
    'block_h_stairs': { id: 'block_h_stairs', type: 'stairs', label: 'Block H Stairs', x: 510, y: 350, building: 'block_h' },
    'block_h_gf': { id: 'block_h_gf', type: 'room', label: 'Block H Ground Floor', x: 510, y: 345, building: 'block_h', floor: 0 },
    'block_h_1f': { id: 'block_h_1f', type: 'room', label: 'Block H 1st Floor', x: 510, y: 345, building: 'block_h', floor: 1 },
    'block_h_2f': { id: 'block_h_2f', type: 'room', label: 'Block H 2nd Floor', x: 510, y: 345, building: 'block_h', floor: 2 },

    // ── BLOCK I/J (Chemical) ────────────────────────────────────────────────
    'block_ij_exit': { id: 'block_ij_exit', type: 'building_exit', label: 'Block I/J Exit', x: 410, y: 375, building: 'block_ij' },
    'block_ij_entry': { id: 'block_ij_entry', type: 'building_entry', label: 'Block I/J Entry', x: 410, y: 375, building: 'block_ij' },
    'block_ij_stairs': { id: 'block_ij_stairs', type: 'stairs', label: 'Block I/J Stairs', x: 410, y: 355, building: 'block_ij' },
    'block_ij_gf': { id: 'block_ij_gf', type: 'room', label: 'Block I/J Ground Floor', x: 410, y: 350, building: 'block_ij', floor: 0 },
    'block_ij_1f': { id: 'block_ij_1f', type: 'room', label: 'Block I/J 1st Floor', x: 410, y: 350, building: 'block_ij', floor: 1 },
    'block_ij_2f': { id: 'block_ij_2f', type: 'room', label: 'Block I/J 2nd Floor', x: 410, y: 350, building: 'block_ij', floor: 2 },

    // ── BLOCK K (Applied Science) ────────────────────────────────────────────
    'block_k_exit': { id: 'block_k_exit', type: 'building_exit', label: 'Block K Exit', x: 310, y: 375, building: 'block_k' },
    'block_k_entry': { id: 'block_k_entry', type: 'building_entry', label: 'Block K Entry', x: 310, y: 375, building: 'block_k' },
    'block_k_stairs': { id: 'block_k_stairs', type: 'stairs', label: 'Block K Stairs', x: 310, y: 355, building: 'block_k' },
    'block_k_gf': { id: 'block_k_gf', type: 'room', label: 'Block K Ground Floor', x: 310, y: 350, building: 'block_k', floor: 0 },
    'block_k_1f': { id: 'block_k_1f', type: 'room', label: 'Block K 1st Floor', x: 310, y: 350, building: 'block_k', floor: 1 },
    'block_k_2f': { id: 'block_k_2f', type: 'room', label: 'Block K 2nd Floor', x: 310, y: 350, building: 'block_k', floor: 2 },

    // ── BLOCK L (Textile) ────────────────────────────────────────────────────
    'block_l_exit': { id: 'block_l_exit', type: 'building_exit', label: 'Block L Exit', x: 205, y: 375, building: 'block_l' },
    'block_l_entry': { id: 'block_l_entry', type: 'building_entry', label: 'Block L Entry', x: 205, y: 375, building: 'block_l' },
    'block_l_stairs': { id: 'block_l_stairs', type: 'stairs', label: 'Block L Stairs', x: 205, y: 355, building: 'block_l' },
    'block_l_gf': { id: 'block_l_gf', type: 'room', label: 'Block L Ground Floor', x: 205, y: 350, building: 'block_l', floor: 0 },
    'block_l_1f': { id: 'block_l_1f', type: 'room', label: 'Block L 1st Floor', x: 205, y: 350, building: 'block_l', floor: 1 },
    'block_l_2f': { id: 'block_l_2f', type: 'room', label: 'Block L 2nd Floor', x: 205, y: 350, building: 'block_l', floor: 2 },

    // ── TIFAC ────────────────────────────────────────────────────────────────
    'tifac_exit': { id: 'tifac_exit', type: 'building_exit', label: 'TIFAC Exit', x: 100, y: 375, building: 'tifac' },
    'tifac_entry': { id: 'tifac_entry', type: 'building_entry', label: 'TIFAC Entry', x: 100, y: 375, building: 'tifac' },
    'tifac_gf': { id: 'tifac_gf', type: 'room', label: 'TIFAC Ground Floor', x: 100, y: 355, building: 'tifac', floor: 0 },
    'tifac_1f': { id: 'tifac_1f', type: 'room', label: 'TIFAC 1st Floor', x: 100, y: 355, building: 'tifac', floor: 1 },
};

// ─── CAMPUS GRAPH (adjacency list with weights) ───────────────────────────────
// weight = approximate walking time in seconds
export const CAMPUS_GRAPH = {
    // Outdoor network
    outdoor_top: [['outdoor_left', 40], ['outdoor_right', 40], ['outdoor_ne', 20], ['outdoor_nw', 20], ['block_a_exit', 10], ['block_b_exit', 10], ['block_c_exit', 10], ['block_d_exit', 10]],
    outdoor_right: [['outdoor_top', 40], ['outdoor_bottom', 40], ['outdoor_ne', 25], ['block_e_exit', 8], ['block_f_exit', 8], ['block_g_exit', 10], ['block_h_exit', 12]],
    outdoor_bottom: [['outdoor_left', 40], ['outdoor_right', 40], ['block_ij_exit', 8], ['block_k_exit', 8], ['block_l_exit', 10], ['tifac_exit', 12]],
    outdoor_left: [['outdoor_top', 40], ['outdoor_bottom', 40], ['outdoor_nw', 25], ['block_a_exit', 15], ['tifac_exit', 15]],
    outdoor_center: [['outdoor_top', 20], ['outdoor_right', 20], ['outdoor_bottom', 20], ['outdoor_left', 20]],
    outdoor_ne: [['outdoor_top', 20], ['outdoor_right', 25], ['block_d_exit', 12], ['block_e_exit', 12]],
    outdoor_nw: [['outdoor_top', 20], ['outdoor_left', 25], ['block_a_exit', 12]],

    // Block A
    block_a_exit: [['outdoor_top', 10], ['outdoor_left', 15], ['outdoor_nw', 12], ['block_a_entry', 0]],
    block_a_entry: [['block_a_exit', 0], ['block_a_gf', 5], ['block_a_stairs', 8]],
    block_a_stairs: [['block_a_entry', 8], ['block_a_gf', 5], ['block_a_1f', 10], ['block_a_2f', 20]],
    block_a_gf: [['block_a_stairs', 5], ['block_a_entry', 5]],
    block_a_1f: [['block_a_stairs', 10]],
    block_a_2f: [['block_a_stairs', 20]],

    // Block B
    block_b_exit: [['outdoor_top', 10], ['block_b_entry', 0]],
    block_b_entry: [['block_b_exit', 0], ['block_b_gf', 5], ['block_b_stairs', 8]],
    block_b_stairs: [['block_b_entry', 8], ['block_b_gf', 5], ['block_b_1f', 10], ['block_b_2f', 20]],
    block_b_gf: [['block_b_stairs', 5], ['block_b_entry', 5]],
    block_b_1f: [['block_b_stairs', 10]],
    block_b_2f: [['block_b_stairs', 20]],

    // Block C
    block_c_exit: [['outdoor_top', 10], ['block_c_entry', 0]],
    block_c_entry: [['block_c_exit', 0], ['block_c_gf', 5], ['block_c_stairs', 8]],
    block_c_stairs: [['block_c_entry', 8], ['block_c_gf', 5], ['block_c_1f', 10], ['block_c_2f', 20]],
    block_c_gf: [['block_c_stairs', 5], ['block_c_entry', 5]],
    block_c_1f: [['block_c_stairs', 10]],
    block_c_2f: [['block_c_stairs', 20]],

    // Block D
    block_d_exit: [['outdoor_top', 10], ['outdoor_ne', 12], ['block_d_entry', 0]],
    block_d_entry: [['block_d_exit', 0], ['block_d_gf', 5], ['block_d_stairs', 8]],
    block_d_stairs: [['block_d_entry', 8], ['block_d_gf', 5], ['block_d_1f', 10]],
    block_d_gf: [['block_d_stairs', 5], ['block_d_entry', 5]],
    block_d_1f: [['block_d_stairs', 10]],

    // Block E
    block_e_exit: [['outdoor_ne', 12], ['outdoor_right', 8], ['block_e_entry', 0]],
    block_e_entry: [['block_e_exit', 0], ['block_e_gf', 5], ['block_e_stairs', 8]],
    block_e_stairs: [['block_e_entry', 8], ['block_e_gf', 5], ['block_e_1f', 10], ['block_e_2f', 20]],
    block_e_gf: [['block_e_stairs', 5], ['block_e_entry', 5]],
    block_e_1f: [['block_e_stairs', 10]],
    block_e_2f: [['block_e_stairs', 20]],

    // Block F
    block_f_exit: [['outdoor_right', 8], ['block_f_entry', 0]],
    block_f_entry: [['block_f_exit', 0], ['block_f_gf', 5], ['block_f_stairs', 8]],
    block_f_stairs: [['block_f_entry', 8], ['block_f_gf', 5], ['block_f_1f', 10], ['block_f_2f', 20]],
    block_f_gf: [['block_f_stairs', 5], ['block_f_entry', 5]],
    block_f_1f: [['block_f_stairs', 10]],
    block_f_2f: [['block_f_stairs', 20]],

    // Block G
    block_g_exit: [['outdoor_right', 10], ['block_g_entry', 0]],
    block_g_entry: [['block_g_exit', 0], ['block_g_gf', 5], ['block_g_stairs', 8]],
    block_g_stairs: [['block_g_entry', 8], ['block_g_gf', 5], ['block_g_1f', 10], ['block_g_2f', 20]],
    block_g_gf: [['block_g_stairs', 5], ['block_g_entry', 5]],
    block_g_1f: [['block_g_stairs', 10]],
    block_g_2f: [['block_g_stairs', 20]],

    // Block H
    block_h_exit: [['outdoor_right', 12], ['outdoor_bottom', 15], ['block_h_entry', 0]],
    block_h_entry: [['block_h_exit', 0], ['block_h_gf', 5], ['block_h_stairs', 8]],
    block_h_stairs: [['block_h_entry', 8], ['block_h_gf', 5], ['block_h_1f', 10], ['block_h_2f', 20]],
    block_h_gf: [['block_h_stairs', 5], ['block_h_entry', 5]],
    block_h_1f: [['block_h_stairs', 10]],
    block_h_2f: [['block_h_stairs', 20]],

    // Block I/J
    block_ij_exit: [['outdoor_bottom', 8], ['block_ij_entry', 0]],
    block_ij_entry: [['block_ij_exit', 0], ['block_ij_gf', 5], ['block_ij_stairs', 8]],
    block_ij_stairs: [['block_ij_entry', 8], ['block_ij_gf', 5], ['block_ij_1f', 10], ['block_ij_2f', 20]],
    block_ij_gf: [['block_ij_stairs', 5], ['block_ij_entry', 5]],
    block_ij_1f: [['block_ij_stairs', 10]],
    block_ij_2f: [['block_ij_stairs', 20]],

    // Block K
    block_k_exit: [['outdoor_bottom', 8], ['block_k_entry', 0]],
    block_k_entry: [['block_k_exit', 0], ['block_k_gf', 5], ['block_k_stairs', 8]],
    block_k_stairs: [['block_k_entry', 8], ['block_k_gf', 5], ['block_k_1f', 10], ['block_k_2f', 20]],
    block_k_gf: [['block_k_stairs', 5], ['block_k_entry', 5]],
    block_k_1f: [['block_k_stairs', 10]],
    block_k_2f: [['block_k_stairs', 20]],

    // Block L
    block_l_exit: [['outdoor_bottom', 10], ['outdoor_left', 12], ['block_l_entry', 0]],
    block_l_entry: [['block_l_exit', 0], ['block_l_gf', 5], ['block_l_stairs', 8]],
    block_l_stairs: [['block_l_entry', 8], ['block_l_gf', 5], ['block_l_1f', 10], ['block_l_2f', 20]],
    block_l_gf: [['block_l_stairs', 5], ['block_l_entry', 5]],
    block_l_1f: [['block_l_stairs', 10]],
    block_l_2f: [['block_l_stairs', 20]],

    // TIFAC
    tifac_exit: [['outdoor_bottom', 12], ['outdoor_left', 15], ['tifac_entry', 0]],
    tifac_entry: [['tifac_exit', 0], ['tifac_gf', 5]],
    tifac_gf: [['tifac_entry', 5]],
    tifac_1f: [['tifac_entry', 10]],
};

// ─── DIJKSTRA ALGORITHM ───────────────────────────────────────────────────────
export function dijkstra(graph, startId, endId) {
    const dist = {};
    const prev = {};
    const visited = new Set();
    const queue = Object.keys(graph).concat(
        Object.keys(NODES).filter(k => !Object.keys(graph).includes(k))
    );

    queue.forEach(n => { dist[n] = Infinity; prev[n] = null; });
    dist[startId] = 0;

    while (queue.length > 0) {
        const u = queue
            .filter(n => !visited.has(n) && dist[n] !== undefined)
            .reduce((a, b) => (dist[a] ?? Infinity) < (dist[b] ?? Infinity) ? a : b, null);

        if (!u || dist[u] === Infinity || u === endId) break;
        visited.add(u);
        queue.splice(queue.indexOf(u), 1);

        const neighbors = graph[u] || [];
        for (const [v, w] of neighbors) {
            const alt = dist[u] + w;
            if (alt < (dist[v] ?? Infinity)) {
                dist[v] = alt;
                prev[v] = u;
            }
        }
    }

    const path = [];
    let cur = endId;
    while (cur) { path.unshift(cur); cur = prev[cur]; }
    if (path[0] !== startId) return [];
    return path;
}

// ─── BUILDING FLOORS COUNT ────────────────────────────────────────────────────
export const BUILDING_FLOORS = {
    block_a: 3, block_b: 3, block_c: 3, block_d: 2,
    block_e: 3, block_f: 2, block_g: 1, block_h: 1,
    block_ij: 1, block_k: 1, block_l: 1, tifac: 1,
};

// ─── BUILDING ROOM LOOKUP (per floor) ────────────────────────────────────────
// Structure: { buildingId: { [floorIndex]: [...roomNames] } }
export const BUILDING_ROOMS = {
    block_a: {
        0: ['Reception / Lobby', 'Principal\'s Office', 'Administration', 'Placement Cell', 'Security Office', 'Conference Room'],
        1: ['Faculty Room A', 'Faculty Room B', 'HOD Office', 'Seminar Hall'],
        2: ['Admin Suite', 'Accounts Office', 'VC Office'],
    },
    block_b: {
        0: ['Architecture Studio', 'Drafting Hall', 'Reception'],
        1: ['Design Lab', 'Model Workshop', 'Faculty Room'],
        2: ['Research Studio', 'Advanced Design Lab'],
    },
    block_c: {
        0: ['Computer Lab 1', 'Computer Lab 2', 'Network Lab', 'Server Room', 'HOD Office', 'Reception'],
        1: ['AI / ML Research Lab', 'Cybersecurity Lab', 'Faculty Room A', 'Faculty Room B', 'Project Room'],
        2: ['Seminar Hall', 'Research Lab', 'Software Dev Lab', 'Utility & Print'],
    },
    block_d: {
        0: ['Reading Hall', 'Issue Counter', 'Digital Section'],
        1: ['Digital Library', 'Reference Section', 'Research Corner'],
    },
    block_e: {
        0: ['Circuit Lab', 'Reception'],
        1: ['Power Systems Lab', 'Control Lab'],
        2: ['Simulation Room', 'Research Lab'],
    },
    block_f: {
        0: ['Electronics Lab', 'PCB Design Lab', 'Reception'],
        1: ['Embedded Systems Lab', 'Communication Lab'],
    },
    block_g: {
        0: ['Instrumentation Lab', 'Process Control Lab', 'Sensor Lab', 'IC Design Room'],
    },
    block_h: {
        0: ['Networking Lab', 'Cloud Lab', 'Cybersecurity Center', 'IT Project Room'],
    },
    block_ij: {
        0: ['Chemical Lab', 'Wet Lab', 'Process Lab', 'Research Lab'],
    },
    block_k: {
        0: ['Drawing Hall A', 'Drawing Hall B', 'Humanities Room', 'Applied Physics Lab'],
    },
    block_l: {
        0: ['Weaving Lab', 'Textile Design Studio', 'Fiber Lab', 'Textile Testing Lab'],
    },
    tifac: {
        0: ['Innovation Hub', 'Research Lab', 'Conference Hall', 'Prototype Lab'],
    },
};

// Helper: get flat room list for a building+floor
export function getRoomsForFloor(buildingId, floor) {
    const b = BUILDING_ROOMS[buildingId];
    if (!b) return [];
    return b[floor] || b[0] || [];
}

// ─── NAVIGATION STEP DESCRIPTIONS ────────────────────────────────────────────
const FLOOR_NAMES = { 0: 'Ground Floor', 1: '1st Floor', 2: '2nd Floor', 3: '3rd Floor' };

// ─── STEP GENERATOR ──────────────────────────────────────────────────────────
export function generateNavSteps(nodePath, fromBuilding, fromLabel, toBuilding, toLabel, toRoom, toFloor) {
    if (!nodePath || nodePath.length === 0) return [];

    const steps = [];
    const fromNode = NODES[nodePath[0]];

    steps.push({
        id: 'step_start',
        type: 'start',
        icon: '📍',
        title: `Start at ${fromLabel}`,
        description: `You are currently at ${fromLabel}.`,
        routeNodes: [nodePath[0]],
        highlightBuildings: [fromBuilding],
        fromNode: nodePath[0],
        toNode: nodePath[0],
        building: fromBuilding,
        floor: fromNode?.floor ?? 0
    });

    let indoorSegment = [];
    let outdoorSegment = [];
    let enteredDest = false;

    for (let i = 0; i < nodePath.length; i++) {
        const nId = nodePath[i];
        const node = NODES[nId];
        if (!node) continue;

        if (node.type === 'building_exit' && node.building === fromBuilding && i > 0) {
            steps.push({
                id: `step_exit_${fromBuilding}`,
                type: 'exit',
                icon: '🚪',
                title: `Exit ${fromLabel}`,
                description: `Walk through the main corridor and exit ${fromLabel}.`,
                routeNodes: [...(indoorSegment.length ? indoorSegment : [nodePath[0]]), nId],
                highlightBuildings: [fromBuilding],
                fromNode: nodePath[0],
                toNode: nId,
                building: fromBuilding,
                floor: node.floor ?? 0
            });
            indoorSegment = [];
            outdoorSegment = [nId];
            continue;
        }

        if (node.type === 'outdoor') {
            outdoorSegment.push(nId);
            continue;
        }

        if (node.type === 'building_entry' && node.building === toBuilding && !enteredDest) {
            if (outdoorSegment.length > 1) {
                steps.push({
                    id: `step_campus_walk`,
                    type: 'campus_walk',
                    icon: '🚶',
                    title: `Walk to ${toLabel}`,
                    description: `Walk across the campus from ${fromLabel} to ${toLabel}.`,
                    routeNodes: [...outdoorSegment, nId],
                    highlightBuildings: [fromBuilding, toBuilding],
                    fromNode: outdoorSegment[0],
                    toNode: nId,
                    building: 'campus'
                });
            }
            steps.push({
                id: `step_enter_${toBuilding}`,
                type: 'enter',
                icon: '🏢',
                title: `Enter ${toLabel}`,
                description: `Arrive at ${toLabel} and enter through the main entrance.`,
                routeNodes: [nId],
                highlightBuildings: [toBuilding],
                fromNode: nId,
                toNode: nId,
                building: toBuilding,
                floor: node.floor ?? 0
            });
            enteredDest = true;
            outdoorSegment = [];
            continue;
        }

        if (node.type === 'stairs' && node.building === toBuilding) {
            steps.push({
                id: `step_stairs_${toBuilding}`,
                type: 'stairs',
                icon: '🪜',
                title: `Take stairs in ${toBuilding === fromBuilding ? fromLabel : toLabel}`,
                description: `Use the stairs to reach the ${FLOOR_NAMES[toFloor] || 'correct floor'}.`,
                routeNodes: [nId],
                highlightBuildings: [toBuilding],
                fromNode: nId,
                toNode: nId,
                building: toBuilding,
                floor: node.floor ?? 0
            });
            if (toFloor > 0) {
                steps.push({
                    id: `step_floor_${toBuilding}`,
                    type: 'floor_change',
                    icon: '🔼',
                    title: `Reach ${FLOOR_NAMES[toFloor] || `Floor ${toFloor}`}`,
                    description: `Climb to the ${FLOOR_NAMES[toFloor] || `Floor ${toFloor}`}.`,
                    routeNodes: [nId],
                    highlightBuildings: [toBuilding],
                    fromNode: nId,
                    toNode: nodePath[nodePath.length - 1],
                    building: toBuilding,
                    floor: toFloor
                });
            }
            continue;
        }
    }

    steps.push({
        id: 'step_destination',
        type: 'destination',
        icon: '🎯',
        title: `Arrive at ${toRoom}`,
        description: `You have arrived at ${toRoom} in ${toLabel}${toFloor > 0 ? `, ${FLOOR_NAMES[toFloor]}` : ''}.`,
        routeNodes: [nodePath[nodePath.length - 1]],
        highlightBuildings: [toBuilding],
        fromNode: nodePath[nodePath.length - 1],
        toNode: nodePath[nodePath.length - 1],
        building: toBuilding,
        floor: toFloor,
        toRoom,   // ← pass actual room name for minimap matching
        toFloor,  // ← pass target floor index
    });

    return steps;
}

export function getStartNodeForBuilding(buildingId) {
    return `${buildingId}_entry`;
}

export function getDestNodeForBuilding(buildingId, floor) {
    const floorKey = floor === 0 ? 'gf' : `${floor}f`;
    return `${buildingId}_${floorKey}`;
}
