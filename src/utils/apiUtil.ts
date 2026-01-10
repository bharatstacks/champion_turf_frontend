// src/utils/apiUtil.ts

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
const BASE_URL =  'http://localhost:3000/api/'; // Default to localhost if the variable is not set
// const BASE_URL =  'https://turfbookingserver.onrender.com/api/';

// Define a custom Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL, // replace with your API's base URL
});

// Request and response interceptors can be configured here (optional)
// apiClient.interceptors.request.use(
//   (config: AxiosRequestConfig) => {
//     const token = localStorage.getItem('token'); // Example: Retrieve token from localStorage
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Handle response errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Handle specific error types (e.g., 401 Unauthorized)
    if (error.response?.status === 401) {
      console.error('Unauthorized, please log in again.');
    }
    return Promise.reject(error);
  }
);

// API Call Function
const apiCall = async <T>(method: string, url: string, data?: any): Promise<T> => {
  try {
    const response = await apiClient({
      method,
      url,
      data,
    });
    return response.data; // Return the response data
  } catch (error) {
    console.error('API call failed: ', error);
    throw error; // Rethrow the error
  }
};

// Helper functions for each HTTP method
export const get = <T>(url: string): Promise<T> => apiCall<T>('get', url);
export const post = <T>(url: string, data: any): Promise<T> => apiCall<T>('post', url, data);
export const put = <T>(url: string, data: any): Promise<T> => apiCall<T>('put', url, data);
export const del = <T>(url: string): Promise<T> => apiCall<T>('delete', url);

export default apiClient;
