const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_BASE = RAW_BASE.replace(/\/+$/, '').replace(/\/api$/, '');

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = opts;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth && typeof window !== 'undefined') {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('access_token');
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const rawMsg = data?.message ?? data?.detail ?? `Request failed (${res.status})`;
    throw new ApiError(
      Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg,
      res.status,
      data,
    );
  }

  return data as T;
}

export const api = {
  get: <T = any>(path: string, auth = true) => request<T>(path, { method: 'GET', auth }),
  post: <T = any>(path: string, body?: any, auth = true) =>
    request<T>(path, { method: 'POST', body, auth }),
  patch: <T = any>(path: string, body?: any, auth = true) =>
    request<T>(path, { method: 'PATCH', body, auth }),
  put: <T = any>(path: string, body?: any, auth = true) =>
    request<T>(path, { method: 'PUT', body, auth }),
  delete: <T = any>(path: string, auth = true) =>
    request<T>(path, { method: 'DELETE', auth }),
};