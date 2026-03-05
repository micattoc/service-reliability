import axios from 'axios';

const client = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error interceptor to log API errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 'network error';

    const detail = error.response?.data?.detail ?? error.message;

    console.error(`[API] ${status}: ${detail}`);
    return Promise.reject(error);
  }
);

export default client;
