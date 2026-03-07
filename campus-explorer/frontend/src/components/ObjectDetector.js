// ObjectDetector.js — Singleton TF.js COCO-SSD wrapper with campus context mapping

// Campus context: maps COCO-SSD class names to AR hotspot info
const CAMPUS_CONTEXT = {
    door: {
        name: 'Lab Exit / Entry',
        direction: 'Main Corridor',
        nextLocation: 'Library',
        distance: '~3m',
        emoji: '🚪',
        color: '#5B4FE9',
        description: 'Door detected — follow the corridor to reach the library.',
    },
    chair: {
        name: 'Seating Area',
        direction: 'Current Lab Section',
        nextLocation: 'Front Desk',
        distance: '~1m',
        emoji: '🪑',
        color: '#10B981',
        description: 'Available seating area in this lab section.',
    },
    monitor: {
        name: 'Workstation',
        direction: 'Lab Section A',
        nextLocation: 'Help Desk',
        distance: '~2m',
        emoji: '🖥️',
        color: '#F59E0B',
        description: 'Workstation with Dell i7 system — Computer Lab.',
    },
    laptop: {
        name: 'Laptop Station',
        direction: 'Lab Row B',
        nextLocation: 'Charging Point',
        distance: '~2m',
        emoji: '💻',
        color: '#F59E0B',
        description: 'Laptop workstation — CS Lab.',
    },
    tv: {
        name: 'Display / Board',
        direction: 'Entrance Wall',
        nextLocation: 'Reception',
        distance: '~5m',
        emoji: '📺',
        color: '#6366F1',
        description: 'Campus display board with announcements.',
    },
    person: {
        name: 'Campus Member',
        direction: 'Nearby',
        nextLocation: 'Info Desk',
        distance: 'nearby',
        emoji: '👤',
        color: '#EF4444',
        description: 'Student or staff member detected.',
    },
    book: {
        name: 'Library Resource',
        direction: 'Shelf Section',
        nextLocation: 'Issue Desk',
        distance: '~10m',
        emoji: '📚',
        color: '#8B5CF6',
        description: 'Book or library resource detected.',
    },
    keyboard: {
        name: 'Computer Station',
        direction: 'Lab Row C',
        nextLocation: 'Exit',
        distance: '~4m',
        emoji: '⌨️',
        color: '#14B8A6',
        description: 'Computer station with keyboard and peripherals.',
    },
    mouse: {
        name: 'Computer Station',
        direction: 'Lab Row C',
        nextLocation: 'Exit',
        distance: '~4m',
        emoji: '🖱️',
        color: '#14B8A6',
        description: 'Computer station detected.',
    },
    'cell phone': {
        name: 'Device Zone',
        direction: 'Current Location',
        nextLocation: 'Charging Point',
        distance: 'nearby',
        emoji: '📱',
        color: '#EC4899',
        description: 'Electronics device detected.',
    },
    clock: {
        name: 'Time Reference',
        direction: 'Wall Section',
        nextLocation: 'Corridor',
        distance: '~3m',
        emoji: '🕐',
        color: '#94A3B8',
        description: 'Campus clock / time reference point.',
    },
    backpack: {
        name: 'Student Area',
        direction: 'Seating Zone',
        nextLocation: 'Locker Room',
        distance: '~5m',
        emoji: '🎒',
        color: '#F97316',
        description: 'Student backpack / belongings zone.',
    },
};

let _model = null;
let _loading = false;

class ObjectDetector {
    /**
     * Load COCO-SSD model once and cache it.
     * @param {function} onProgress - called with (progress: 0-1)
     */
    static async load(onProgress) {
        if (_model) return _model;
        if (_loading) {
            // Wait for existing load
            while (_loading) await new Promise(r => setTimeout(r, 100));
            return _model;
        }
        _loading = true;
        try {
            if (onProgress) onProgress(0.1);
            _model = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
            if (onProgress) onProgress(1);
            console.log('✅ COCO-SSD model loaded');
        } finally {
            _loading = false;
        }
        return _model;
    }

    /**
     * Run detection on a video element. Returns array of campus-contextualised detections.
     * @param {HTMLVideoElement} video
     * @param {number} minConfidence
     */
    static async detect(video, minConfidence = 0.45) {
        if (!_model || video.readyState < 2) return [];

        const predictions = await _model.detect(video);

        return predictions
            .filter(p => p.score >= minConfidence && CAMPUS_CONTEXT[p.class])
            .map(p => ({
                class: p.class,
                score: p.score,
                bbox: p.bbox, // [x, y, width, height] in video pixel space
                info: CAMPUS_CONTEXT[p.class],
            }));
    }

    static getCampusContext(className) {
        return CAMPUS_CONTEXT[className] || null;
    }

    static get supportedClasses() {
        return Object.keys(CAMPUS_CONTEXT);
    }
}

export default ObjectDetector;
