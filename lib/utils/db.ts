import axios from 'axios';
const BASE_URL_PROD = 'https://fitness-tracker-dusky-eight.vercel.app/';
const BASE_URL_LOCAL = 'http://192.168.0.101:5000';
const BASE_URL = __DEV__ ? BASE_URL_LOCAL : BASE_URL_PROD;
console.log('BASE_URL', BASE_URL);
const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`, // Base URL for all requests
  timeout: 10000, // Timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
