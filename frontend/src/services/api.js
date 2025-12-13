import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : 'https://chat-summarizer.onrender.com/api');

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updatePreferences: (data) => api.put('/auth/preferences', data),
};

// Chat API
export const chatAPI = {
    sendMessage: (data) => api.post('/chat', data),
    getConversations: (params) => api.get('/chat/conversations', { params }),
    getConversation: (id) => api.get(`/chat/conversations/${id}`),
    updateConversation: (id, data) => api.put(`/chat/conversations/${id}`, data),
    deleteConversation: (id) => api.delete(`/chat/conversations/${id}`),
};

// Analysis API
export const analysisAPI = {
    summarize: (conversationId) => api.post(`/analysis/summarize/${conversationId}`),
    analyze: (conversationId) => api.post(`/analysis/analyze/${conversationId}`),
    queryHistory: (data) => api.post('/analysis/query', data),
    getInsights: () => api.get('/analysis/insights'),
};

export default api;
