import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

/**
 * Global Axios Client Instance for SupaCouple
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach authorization token when available in future phases
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Placeholder token handling for future auth integration
    const token = localStorage.getItem('supa_couple_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global response processing and error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired / unauthorized placeholder logic
      console.warn('Unauthorized request - authentication required in future phase');
    }
    return Promise.reject(error);
  }
);
