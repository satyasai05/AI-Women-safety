import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api', // Proxied to localhost:5000 in vite.config.js
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints Mapping
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getContacts: () => api.get('/auth/contacts'),
  addContact: (data) => api.post('/auth/contacts', data),
  deleteContact: (id) => api.delete(`/auth/contacts/${id}`),
};

export const sosAPI = {
  trigger: (lat, lng) => api.post('/sos', { latitude: lat, longitude: lng }),
  getHistory: () => api.get('/sos/history'),
  resolve: (id) => api.post(`/sos/${id}/resolve`),
};

export const aiAPI = {
  scanUpload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/detection/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  scanWebcam: (base64Image) => api.post('/detection/scan', { image: base64Image }),
  getHistory: () => api.get('/detection/history'),
};

export const mapAPI = {
  getNearby: (lat, lng) => api.get(`/map/nearby?lat=${lat}&lng=${lng}`),
};

export const chatAPI = {
  sendMessage: (msg) => api.post('/chat/ask', { message: msg }),
  getHistory: () => api.get('/chat/history'),
};

export const incidentsAPI = {
  report: (formData) => api.post('/incidents/report', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getMyReports: () => api.get('/incidents/my-reports'),
  getCategories: () => api.get('/incidents/categories'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getReports: () => api.get('/admin/reports'),
  updateReportStatus: (id, status) => api.put(`/admin/reports/${id}`, { status }),
  getSOSLogs: () => api.get('/admin/sos'),
  updateSOSStatus: (id, status) => api.put(`/admin/sos/${id}`, { status }),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
