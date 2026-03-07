/**
 * Campus map buildings data — mirrors the BUILDINGS array in CampusMap.jsx.
 * Used by the AI RAG context so it can answer questions about buildings and rooms
 * that may not be in the DB locations table but are visible on the 2D/3D map.
 */
const MAP_BUILDINGS = [
    {
        id: 'block_a', label: 'Block A: Admin & Seminar', floors: 3,
        desc: 'Account Section, Admission Office, Seminar Hall, Principal Office',
        keywords: ['block a', 'admin block', 'seminar hall', 'account section', 'principal office', 'admission office'],
        rooms: ['Account Section', 'Principal Office', 'Admission Office', 'Seminar Hall', 'Faculty Cabins', 'Lecture Halls']
    },
    {
        id: 'block_b', label: 'Block B: Architecture', floors: 3,
        desc: 'Faculty of Architecture — Drafting studios and design labs',
        keywords: ['block b', 'architecture block', 'drafting studio', 'design lab', 'arch block'],
        rooms: ['Architecture Studio', 'Drafting Lab', 'Design Studio', 'Faculty Cabins', 'Lecture Hall']
    },
    {
        id: 'block_c', label: 'Block C: Computer Engineering', floors: 3,
        desc: 'Faculty of Computer Engineering — Programming labs, HOD office, classrooms',
        keywords: ['block c', 'cs block', 'computer block', 'programming lab', 'computer engineering', 'cs department'],
        rooms: ['Computer Lab 1', 'Computer Lab 2', 'Programming Lab', 'HOD Office (CS)', 'Classrooms', 'Faculty Cabins', 'Project Room']
    },
    {
        id: 'block_d', label: 'Block D: Library', floors: 2,
        desc: 'Main Central Library with 50,000+ books, digital resources, reading rooms',
        keywords: ['block d', 'library block', 'central library', 'reading room', 'digital library', 'e-library'],
        rooms: ['Main Reading Hall', 'Digital Library', 'Reference Section', 'Periodicals', 'Stack Room']
    },
    {
        id: 'block_e', label: 'Block E: Electrical Engineering', floors: 3,
        desc: 'Faculty of Electrical Engineering — Circuit design labs, power electronics',
        keywords: ['block e', 'electrical block', 'circuit lab', 'power lab', 'electrical engineering', 'ee block'],
        rooms: ['Electrical Lab', 'Circuit Design Lab', 'Power Electronics Lab', 'Faculty Cabins', 'Classrooms']
    },
    {
        id: 'block_f', label: 'Block F: Electronics & Communication', floors: 3,
        desc: 'Faculty of E&C Engineering — Electronics and communication labs',
        keywords: ['block f', 'electronics block', 'ec block', 'communication lab', 'electronics lab', 'e&c block'],
        rooms: ['Electronics Lab', 'Communication Lab', 'Signal Processing Lab', 'Classrooms', 'Faculty Cabins']
    },
    {
        id: 'block_g', label: 'Block G: Instrumentation', floors: 3,
        desc: 'Faculty of IC Engineering — Control systems and instrumentation labs',
        keywords: ['block g', 'instrumentation block', 'ic block', 'control systems lab', 'instrumentation lab'],
        rooms: ['Instrumentation Lab', 'Control Systems Lab', 'Measurement Lab', 'Faculty Cabins', 'Classrooms']
    },
    {
        id: 'block_h', label: 'Block H: Information Technology', floors: 3,
        desc: 'Faculty of Information Technology — IT labs, networking, server room',
        keywords: ['block h', 'it block', 'information technology', 'networking lab', 'server room', 'it department'],
        rooms: ['IT Lab', 'Networking Lab', 'Server Room', 'HOD Office (IT)', 'Classrooms', 'Faculty Cabins']
    },
    {
        id: 'block_ij', label: 'Block I/J: Chemical Engineering', floors: 3,
        desc: 'Faculty of Chemical Engineering — Wet labs, chemical labs',
        keywords: ['block i', 'block j', 'chemical block', 'wet lab', 'chemical lab', 'chemical engineering'],
        rooms: ['Chemical Lab', 'Wet Lab', 'Organic Chemistry Lab', 'Faculty Cabins', 'Classrooms']
    },
    {
        id: 'block_k', label: 'Block K: Applied Science', floors: 3,
        desc: 'Applied Science — Drawing Halls, Humanities, Physics and Chemistry labs, Science Labs',
        keywords: ['block k', 'applied science', 'drawing hall', 'humanities', 'physics lab', 'chemistry lab', 'science lab', 'science block', 'applied sciences'],
        rooms: ['Physics Lab', 'Chemistry Lab', 'Science Lab', 'Drawing Hall', 'Humanities Dept', 'Mathematics Dept', 'Classrooms']
    },
    {
        id: 'block_l', label: 'Block L: Textile Technology', floors: 3,
        desc: 'Faculty of Textile Technology — Weaving, textile testing labs',
        keywords: ['block l', 'textile block', 'weaving lab', 'textile lab', 'textile technology'],
        rooms: ['Textile Lab', 'Weaving Studio', 'Textile Testing Lab', 'Faculty Cabins', 'Classrooms']
    },
    {
        id: 'tifac', label: 'TIFAC Core Center', floors: 2,
        desc: 'Technology Information, Forecasting and Assessment Council — Research and Innovation center',
        keywords: ['tifac', 'research center', 'innovation center', 'tifac core'],
        rooms: ['Research Lab', 'Innovation Hub', 'Conference Room', 'Faculty Cabins']
    },
    {
        id: 'center_stage', label: 'Amphitheater (Central Stage)', floors: 1,
        desc: 'Central outdoor amphitheater and hexagonal stage for events and cultural programs',
        keywords: ['amphitheater', 'amphi theater', 'central stage', 'open stage', 'outdoor stage', 'hexagonal stage'],
        rooms: ['Amphitheater Stage', 'Seating Area']
    },
];

module.exports = { MAP_BUILDINGS };
