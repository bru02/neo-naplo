import axios from 'axios';

export const apiClient = axios.create({
  baseURL: `${location.protocol}//${location.host}/api`,
  timeout: 10000
});
