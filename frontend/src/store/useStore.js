/* Coded by Lucky */
/* SphereWalk Campus Explorer | Global State Store */
import { create } from 'zustand';

/**
 * Decode a JWT payload without verifying the signature.
 * The backend will reject tampered/expired tokens on every API call.
 * This is client-side only — not a security boundary.
 */
const decodeJwt = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch {
        return null;
    }
};

const isTokenExpired = (token) => {
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) return true;
    return Date.now() / 1000 > payload.exp;
};

const getInitialAuth = () => {
    try {
        const token = localStorage.getItem('campus_token');
        if (!token) return { token: null, isAdmin: false };
        if (isTokenExpired(token)) {
            localStorage.removeItem('campus_token');
            return { token: null, isAdmin: false };
        }
        return { token, isAdmin: true };
    } catch (e) {
        console.warn('LocalStorage access failed:', e);
        return { token: null, isAdmin: false };
    }
};

const useStore = create((set) => ({
    // Admin state — initialised with expiry check
    ...getInitialAuth(),

    setToken: (token) => {
        localStorage.setItem('campus_token', token);
        set({ token, isAdmin: true });
    },
    logout: () => {
        localStorage.removeItem('campus_token');
        set({ token: null, isAdmin: false });
    },

    // Locations
    locations: [],
    setLocations: (locations) => set({ locations }),

    // Events
    events: [],
    liveEvents: [],
    setEvents: (events) => set({ events }),
    setLiveEvents: (liveEvents) => set({ liveEvents }),

    // Tours
    tours: [],
    setTours: (tours) => set({ tours }),

    // AR Navigation
    arDestination: null,
    setArDestination: (dest) => set({ arDestination: dest }),

    // Current page mode
    mode: 'student', // student | visitor | admin
    setMode: (mode) => set({ mode }),
}));

export default useStore;
