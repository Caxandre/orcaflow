import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export const TOKEN_KEY = 'crm_orcamentos_token';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api', timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error: AxiosError<{ message?: string }>) => {
  if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
    sessionStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event('auth:expired'));
  }
  return Promise.reject(error);
});

export const showApiError = (error: unknown, fallback = 'Não foi possível concluir a operação.') => {
  if (axios.isAxiosError(error)) toast.error(error.response?.data?.message ?? fallback);
  else toast.error(fallback);
};
