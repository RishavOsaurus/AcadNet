// src/lib/apiClient.ts
import axios, { type AxiosRequestHeaders } from 'axios';

const BASE_URL = 'https://acad-net.vercel.app/api/v1/';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// interceptor keeps fallback in place if header already set
apiClient.interceptors.request.use(config => {
  if (!config.headers) config.headers = {} as AxiosRequestHeaders;
  const headerExists = (config.headers as AxiosRequestHeaders)['X-CSRF-Token'];
  if (!headerExists && apiClient.defaults.headers.common['X-CSRF-Token']) {
    (config.headers as AxiosRequestHeaders)['X-CSRF-Token'] = apiClient.defaults.headers.common['X-CSRF-Token'];
  }
  return config;
}, error => Promise.reject(error));

// Initialize API client by fetching csrf token from backend (reads cookie server-side)
export async function initApiClient() {
  try {
    const res = await fetch(`${BASE_URL}auth/csrf-token`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      const token = data?.csrfToken;
      if (token) {
        apiClient.defaults.headers.common['X-CSRF-Token'] = token;
      }
    }
  } catch (err) {
    // do not throw - initialization should not block app render
    // but log to console for debugging
    // eslint-disable-next-line no-console
    console.warn('initApiClient failed to fetch CSRF token', err);
  }
}

// Ensure CSRF token is present on the axios client. Safe to call multiple times.
export async function ensureCsrfToken(): Promise<void> {
  if (apiClient.defaults.headers.common['X-CSRF-Token']) return;
  try {
    const res = await fetch(`${BASE_URL}auth/csrf-token`, { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    const token = data?.csrfToken;
    if (token) apiClient.defaults.headers.common['X-CSRF-Token'] = token;
  } catch (err) {
    // do not throw - keep silent
  }
}

export default apiClient;