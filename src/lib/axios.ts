import axios from 'axios';

const baseURL = '';
const key = '';

export const api = axios.create({
  baseURL: '',
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  },
});

export function errorAxios(error: any) {
  if (!error) return;

  if (axios.isAxiosError(error) && error.response?.data.message) {
    return error.response?.data.message;
  } else {
    return error;
  }
}
