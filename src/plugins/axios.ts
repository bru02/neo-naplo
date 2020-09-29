import axios from 'axios';
import axiosRetry from 'axios-retry';
export const apiClient = axios.create({
  baseURL: `${location.protocol}//${location.host}/api`,
  timeout: 10000,
});
axiosRetry(apiClient, { retries: 3 });
