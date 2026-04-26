/* Coded by Lucky */
/* SphereWalk Campus Explorer | API Service */
import axios from 'axios';

const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com';
};

export const API_BASE_URL = getBaseUrl();
const API = axios.create({ baseURL: API_BASE_URL });

// ── Attach JWT token to every request ────────────────────────────────────────
API.interceptors.request.use(cfg => {
    const token = localStorage.getItem('campus_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// ── Auto-logout on 401 (expired or invalid token) ────────────────────────────
API.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('campus_token');
            // Dispatch a custom event so Zustand store can react without a circular import
            window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
        return Promise.reject(error);
    }
);

// ── Locations ─────────────────────────────────────────────────────────────────
export const getLocations    = ()         => API.get('/api/locations');
export const addLocation     = (data)     => API.post('/api/locations', data);
export const updateLocation  = (id, data) => API.put(`/api/locations/${id}`, data);
export const deleteLocation  = (id)       => API.delete(`/api/locations/${id}`);

// ── Events ────────────────────────────────────────────────────────────────────
export const getEvents       = ()         => API.get('/api/events');
export const getLiveEvents   = ()         => API.get('/api/events/live');
export const addEvent        = (data)     => API.post('/api/events', data);
export const updateEvent     = (id, data) => API.put(`/api/events/${id}`, data);
export const deleteEvent     = (id)       => API.delete(`/api/events/${id}`);

// ── Tours ─────────────────────────────────────────────────────────────────────
export const getTours        = ()         => API.get('/api/tours');
export const addTour         = (data)     => API.post('/api/tours', data);
export const updateTour      = (id, data) => API.put(`/api/tours/${id}`, data);
export const deleteTour      = (id)       => API.delete(`/api/tours/${id}`);

// ── Misc ──────────────────────────────────────────────────────────────────────
export const getQR           = (id)               => `${API_BASE_URL}/api/qr/${id}`;
export const logSearch       = (query, locationId) => API.post('/api/analytics/search', { query, locationId });
export const getAnalytics    = ()                  => API.get('/api/analytics');

// ── Auth ──────────────────────────────────────────────────────────────────────
export const adminLogin      = (username, password) => API.post('/api/auth/login', { username, password });

// ── AI Chat ───────────────────────────────────────────────────────────────────
export const sendChatMessage = (messages) => API.post('/api/chat', { messages });

// ── Campus Info (AI Knowledge Base) ──────────────────────────────────────────
export const getCampusInfo    = ()         => API.get('/api/campus-info');
export const addCampusInfo    = (data)     => API.post('/api/campus-info', data);
export const updateCampusInfo = (id, data) => API.put(`/api/campus-info/${id}`, data);
export const deleteCampusInfo = (id)       => API.delete(`/api/campus-info/${id}`);

export default API;
