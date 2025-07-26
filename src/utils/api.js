export async function handleApiError(res) {
  if (res.status === 401 || res.status === 403) {
    try {
      const data = await res.clone().json().catch(() => ({}));
      const message = data.error || 'Sesión inválida';
      window.alert(message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('approved');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('email');
      window.location.reload();
    }
  }
}

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  await handleApiError(res);
  return res;
}
