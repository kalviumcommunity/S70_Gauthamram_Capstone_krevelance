import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
    
      console.log('JWT expired or invalid, redirecting to login...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
    
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default api;