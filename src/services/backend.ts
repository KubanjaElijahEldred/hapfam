/**
 * HAPFAM REST client. Talks to the Express/PostgreSQL API when available.
 * EXPO_PUBLIC_API_URL should point at the deployed or local API.
 */
const BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000').replace(/\/$/, '');

let token: string | null = null;
const KEY = 'hapfam_auth_token';
if (typeof window !== 'undefined' && (window as any).localStorage) {
  try { token = (window as any).localStorage.getItem(KEY); } catch { /* ignore */ }
}
export function setToken(t: string | null) {
  token = t;
  if (typeof window !== 'undefined' && (window as any).localStorage) {
    try { t ? (window as any).localStorage.setItem(KEY, t) : (window as any).localStorage.removeItem(KEY); } catch { /* ignore */ }
  }
}
export function getToken() { return token; }

export interface User { id: string; name: string; email: string; role: string; department: string }

export async function request<T = any>(path: string, opts: { method?: string; body?: any; auth?: boolean } = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Ngrok-Skip-Browser-Warning': 'true',
      ...(opts.auth !== false && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export const auth = {
  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', auth: false, body: { email, password } });
    setToken(data.token);
    return data.user;
  },
  register: (body: { name: string; email: string; password: string; role: string; department: string }) =>
    request<User>('/api/auth/register', { method: 'POST', body }),
  me: () => request<User>('/api/me'),
  health: () => request<{ ok: boolean; db: number }>('/api/health', { auth: false }),
};

export const announcements = {
  list: () => request<any[]>('/api/announcements'),
  create: (body: { title: string; body: string; audience?: string; priority?: string }) =>
    request('/api/announcements', { method: 'POST', body }),
  reply: (id: string, body: string) => request(`/api/announcements/${id}/replies`, { method: 'POST', body: { body } }),
  remove: (id: string) => request(`/api/announcements/${id}`, { method: 'DELETE' }),
};

export const notifications = {
  list: (department?: string) => request<any[]>(`/api/notifications${department ? `?department=${department}` : ''}`),
  markRead: (id: string) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAll: (department?: string) => request(`/api/notifications/read-all${department ? `?department=${department}` : ''}`, { method: 'PATCH' }),
};

export const workflow = {
  issue: (requestId: string, qty: number) => request('/api/workflow/issue', { method: 'POST', body: { requestId, qty } }),
  decision: (batchId: string, decision: string, reason: string, results: Record<string, string>) =>
    request('/api/workflow/decision', { method: 'POST', body: { batchId, decision, reason, results } }),
  delivery: (materialId: string, qty: number, supplier: string) =>
    request('/api/workflow/delivery', { method: 'POST', body: { materialId, qty, supplier } }),
};

export const records = {
  list: (kind: string) => request<any[]>(`/api/records/${kind}`),
  create: (kind: string, body: any) => request(`/api/records/${kind}`, { method: 'POST', body }),
  update: (kind: string, id: string, body: any) => request(`/api/records/${kind}/${id}`, { method: 'PUT', body }),
  remove: (kind: string, id: string) => request(`/api/records/${kind}/${id}`, { method: 'DELETE' }),
};

export const audit = { list: () => request<any[]>('/api/audit') };
