import axios from 'axios';

export const api = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.headers['request-startTime'] = new Date().getTime();
  return config;
});

api.interceptors.response.use((response) => {
  const currentTime = new Date().getTime();
  const startTime = response.config.headers['request-startTime'] as number;
  response.headers['request-duration'] = currentTime - startTime;
  return response;
});
