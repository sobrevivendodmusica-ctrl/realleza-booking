import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
};

export const events = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getRoster: (id) => api.get(`/events/${id}/roster`),
};

export const bookings = {
  create: (data) => api.post('/bookings', data),
  accept: (id) => api.put(`/bookings/${id}/accept`),
  decline: (id) => api.put(`/bookings/${id}/decline`),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookingNeeds: () => api.get('/bookings/booking-needs'),
};

export const availability = {
  getAll: (params) => api.get('/availability', { params }),
  submit: (data) => api.post('/availability', data),
  submitBulk: (data) => api.post('/availability/bulk', data),
  delete: (id) => api.delete(`/availability/${id}`),
};

export default api;
