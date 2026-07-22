export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const headers = new Headers({
    ...getAuthHeaders(),
  });
  
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (options.headers) {
    const optsHeaders = new Headers(options.headers);
    optsHeaders.forEach((value, key) => headers.set(key, value));
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && !window.location.hash.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '#/login';
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API Request failed');
  }

  // 204 No Content doesn't have JSON body
  if (response.status === 204) return null;
  return response.json();
};
