import { tokenStorage } from './tokenStorage';

/**
 * Cliente HTTP central del frontend.
 * - Base: import.meta.env.VITE_API_URL (p.ej. http://localhost:3000/api/v1)
 * - Inyecta Authorization: Bearer <accessToken>
 * - Desempaqueta el envelope del backend: { success, data, message, error }
 * - Renueva el accessToken automáticamente con /auth/refresh ante un 401 (usa cookie httpOnly)
 */

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
   'http://localhost:3002/api/v1';

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
}

/** Callback opcional para que el authStore reaccione cuando la sesión expira. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/** Renueva el accessToken usando el refreshToken en cookie httpOnly. Devuelve true si tuvo éxito. */
let refreshPromise: Promise<boolean> | null = null;
async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(buildUrl('/auth/refresh'), {
          method: 'POST',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });
        const json = (await res.json().catch(() => null)) as ApiEnvelope<{
          accessToken: string;
          refreshToken?: string;
        }> | null;
        if (!res.ok || !json?.success || !json.data?.accessToken) {
          return false;
        }
        tokenStorage.setAccessToken(json.data.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      }
    })();
  }
  return refreshPromise;
}

async function doFetch<T>(path: string, options: RequestOptions, retrying = false): Promise<T> {
  const { method = 'GET', body, auth = true, query } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.',
      0,
      'network_error',
    );
  }

  // 401 → intenta refrescar una sola vez y reintenta.
  if (res.status === 401 && auth && !retrying) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return doFetch<T>(path, options, true);
    }
    tokenStorage.clear();
    onUnauthorized?.();
  }

  let json: ApiEnvelope<T> | null = null;
  if (res.status !== 204) {
    json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  }

  if (!res.ok || (json && json.success === false)) {
    const message = json?.message || `Error ${res.status}`;
    throw new ApiError(message, res.status, json?.error);
  }

  return (json?.data as T) ?? (undefined as T);
}

/** Igual que doFetch pero envía un FormData (multipart) sin sobrescribir el Content-Type. */
async function doFetchForm<T>(path: string, options: RequestOptions, retrying = false): Promise<T> {
  const { method = 'POST', body, auth = true, query } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };

  if (auth) {
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body as FormData,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.',
      0,
      'network_error',
    );
  }

  if (res.status === 401 && auth && !retrying) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return doFetchForm<T>(path, options, true);
    }
    tokenStorage.clear();
    onUnauthorized?.();
  }

  let json: ApiEnvelope<T> | null = null;
  if (res.status !== 204) {
    json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  }

  if (!res.ok || (json && json.success === false)) {
    const message = json?.message || `Error ${res.status}`;
    throw new ApiError(message, res.status, json?.error);
  }

  return (json?.data as T) ?? (undefined as T);
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    doFetch<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    doFetch<T>(path, { ...opts, method: 'POST', body }),
  postForm: <T>(path: string, form: FormData, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    doFetchForm<T>(path, { ...opts, method: 'POST', body: form }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    doFetch<T>(path, { ...opts, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    doFetch<T>(path, { ...opts, method: 'PUT', body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    doFetch<T>(path, { ...opts, method: 'DELETE' }),
};
