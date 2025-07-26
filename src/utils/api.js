export function handleApiError(res) {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('approved');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('email');
    window.location.reload();
  }
}

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  handleApiError(res);
  return res;
}
