import axios from 'axios';

export const api = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: { 'Content-Type': 'application/json' },
});
