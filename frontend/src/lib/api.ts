import axios from 'axios';
import { API_BASE_URL } from './utils';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  adminLogin: (credentials: { username: string; password: string }) =>
    api.post('/auth/admin/login', credentials),
  
  studentLogin: (credentials: { email: string; password: string }) =>
    api.post('/auth/student/login', credentials),
  
  studentRegister: (data: {
    student_id: string;
    email: string;
    password: string;
    name: string;
    phone?: string;
    college_id: number;
  }) => api.post('/auth/student/register', data),
};

// Events API
export const eventsAPI = {
  getEvents: () => api.get('/events'),
  
  createEvent: (data: {
    title: string;
    description: string;
    event_type: string;
    start_date: string;
    end_date: string;
    location: string;
    max_participants: number;
    registration_deadline?: string;
  }) => api.post('/events', data),
  
  updateEvent: (id: number, data: any) => api.put(`/events/${id}`, data),
  
  deleteEvent: (id: number) => api.delete(`/events/${id}`),
  
  registerForEvent: (eventId: number) => api.post(`/events/${eventId}/register`),
  
  checkInEvent: (eventId: number) => api.post(`/events/${eventId}/checkin`),
  
  submitFeedback: (eventId: number, data: { rating: number; comment?: string }) =>
    api.post(`/events/${eventId}/feedback`, data),
};

// Dashboard API
export const dashboardAPI = {
  getAdminDashboard: () => api.get('/admin/dashboard'),
  
  getStudentDashboard: () => api.get('/student/dashboard'),
  
  getLeaderboard: () => api.get('/leaderboard'),
  
  generateCertificate: (eventId: number, studentId: number) =>
    api.get(`/events/${eventId}/certificate/${studentId}`),
};
