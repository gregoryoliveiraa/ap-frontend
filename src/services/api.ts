import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to log headers
api.interceptors.request.use(
  (config) => {
    // Log request headers for debugging
    console.log('Request headers:', config.headers);
    
    // Se for um FormData, remover o Content-Type para que o Axios defina automaticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Adicionar token de autenticação se disponível
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

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log response for debugging
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error details
    console.error('API Error:', {
      status: error.response?.status,
      headers: error.response?.headers,
      data: error.response?.data
    });
    
    // Handle expired token or unauthorized access
    if (error.response && error.response.status === 401) {
      // Only redirect if not on login page and not on public pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/reset-password')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 