export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || '请求失败');
  return json.data as T;
}
