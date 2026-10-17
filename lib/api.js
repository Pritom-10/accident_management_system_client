export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:5000';
export const API_BASE = `${API_ORIGIN}/api`;

const TOKEN_KEY = 'sahayota_token';

export const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY));
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);


export function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}