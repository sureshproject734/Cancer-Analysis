const API_BASE = '/api';

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
};
