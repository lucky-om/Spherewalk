import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

// Attach JWT token if present
API.interceptors.request.use(cfg => {
    const token = localStorage.getItem('campus_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export const getLocations = () => API.get('/api/locations');
export const addLocation = (data) => API.post('/api/locations', data);
export const updateLocation = (id, data) => API.put(`/api/locations/${id}`, data);
export const deleteLocation = (id) => API.delete(`/api/locations/${id}`);

export const getEvents = () => API.get('/api/events');
export const getLiveEvents = () => API.get('/api/events/live');
export const addEvent = (data) => API.post('/api/events', data);
export const updateEvent = (id, data) => API.put(`/api/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/api/events/${id}`);

export const getTours = () => API.get('/api/tours');
export const addTour = (data) => API.post('/api/tours', data);
export const updateTour = (id, data) => API.put(`/api/tours/${id}`, data);
export const deleteTour = (id) => API.delete(`/api/tours/${id}`);

export const getQR = (id) => `http://localhost:5000/api/qr/${id}`;
export const logSearch = (query, locationId) => API.post('/api/analytics/search', { query, locationId });
export const getAnalytics = () => API.get('/api/analytics');

export const adminLogin = (username, password) => API.post('/api/auth/login', { username, password });
export const sendChatMessage = (messages) => API.post('/api/chat', { messages });

export const getCampusInfo = () => API.get('/api/campus-info');
export const addCampusInfo = (data) => API.post('/api/campus-info', data);
export const updateCampusInfo = (id, data) => API.put(`/api/campus-info/${id}`, data);
export const deleteCampusInfo = (id) => API.delete(`/api/campus-info/${id}`);

export default API;
