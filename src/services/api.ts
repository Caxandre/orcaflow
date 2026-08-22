import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiError, ApiFieldError } from '../types';

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

const isApiError = (value: unknown): value is ApiError =>
  typeof value === 'object' &&
  value !== null &&
  'success' in value &&
  value.success === false &&
  'errors' in value &&
  Array.isArray(value.errors);

// Reconhece o formato de erro de validação/negócio do backend
// ({ success: false, message, errors: [{ field, message }] }) sem `any`/casts
// espalhados pelos consumidores. Só reconhece a forma; não decide o que fazer
// com ela (toast, setError etc.) — essa decisão continua com quem chama.
export const getApiError = (error: unknown): ApiError | undefined => {
  if (!axios.isAxiosError(error)) return undefined;
  const data = error.response?.data;
  return isApiError(data) ? data : undefined;
};

// Parte comum extraída de ClientsPage/ProductsPage/QuoteFormPage: reconhecer
// o erro, percorrer `errors` e agregar um booleano — nada além disso. Não
// conhece React Hook Form, campos de nenhum formulário, nem decide toast:
// quem chama define `applyFieldError` (que decide se consegue apresentar
// aquele erro, tipicamente chamando `setError`) e decide o que fazer quando
// o retorno é `false` (tipicamente `showApiError`).
export const applyApiFieldErrors = (error: unknown, applyFieldError: (fieldError: ApiFieldError) => boolean): boolean => {
  const apiError = getApiError(error);
  if (!apiError || apiError.errors.length === 0) return false;
  let allHandled = true;
  for (const fieldError of apiError.errors) {
    if (!applyFieldError(fieldError)) allHandled = false;
  }
  return allHandled;
};
