import { create } from 'zustand';

const useStore = create((set) => ({
    // Admin state
    token: localStorage.getItem('campus_token') || null,
    isAdmin: !!localStorage.getItem('campus_token'),
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
