/**
 * Frontend API client communicating with Node.js + Express backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to get authorization token
 */
export function getStoredToken() {
  try {
    return localStorage.getItem('emergency_care_token') || '';
  } catch (e) {
    return '';
  }
}

/**
 * Helper to get stored user
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('emergency_care_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Helper to save auth session
 */
export function setStoredSession(token, user) {
  try {
    if (token) localStorage.setItem('emergency_care_token', token);
    if (user) localStorage.setItem('emergency_care_user', JSON.stringify(user));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

/**
 * Helper to clear auth session
 */
export function clearStoredSession() {
  try {
    localStorage.removeItem('emergency_care_token');
    localStorage.removeItem('emergency_care_user');
  } catch (e) {
    console.error('Storage error:', e);
  }
}

/**
 * Universal fetch wrapper with authorization headers
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `HTTP error ${response.status}`);
    error.status = response.status;
    error.code = data.code;
    error.data = data;
    throw error;
  }

  return data;
}

// 1. Auth API Services
export const authAPI = {
  async register(userData) {
    return this.signup(userData);
  },

  async signup({ full_name, email, mobile, password, confirmPassword }) {
    const data = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        full_name,
        email,
        mobile,
        password,
        confirmPassword,
      }),
    });
    if (data.token && data.user) {
      setStoredSession(data.token, data.user);
    }
    return data;
  },

  async login({ email, password }) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token && data.user) {
      setStoredSession(data.token, data.user);
    }
    return data;
  },

  async getMe() {
    return await request('/auth/me');
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearStoredSession();
    }
    return { success: true };
  },
};

// 2. Admin API Services
export const adminAPI = {
  async getStats() {
    return await request('/admin/stats');
  },

  async getUsers({ search = '', role = '', status = '', page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role && role !== 'all') params.append('role', role);
    if (status && status !== 'all') params.append('status', status);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const qs = params.toString();
    return await request(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  async getUserById(id) {
    return await request(`/admin/users/${id}`);
  },

  async updateUser(id, updateData) {
    return await request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  async updateStatus(id, status) {
    return await request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async updateRole(id, role) {
    return await request(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async deleteUser(id) {
    return await request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export const callsAPI = {
  createCall: async (receiverId, callType = 'audio') => {
    return apiFetch('/calls', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, call_type: callType }),
    });
  },
  getCallById: async (id) => {
    return apiFetch(`/calls/${id}`);
  },
  acceptCall: async (id) => {
    return apiFetch(`/calls/${id}/accept`, { method: 'PATCH' });
  },
  rejectCall: async (id) => {
    return apiFetch(`/calls/${id}/reject`, { method: 'PATCH' });
  },
  endCall: async (id) => {
    return apiFetch(`/calls/${id}/end`, { method: 'PATCH' });
  },
  getUserCalls: async (userId) => {
    return apiFetch(`/calls/user/${userId}`);
  },
};

export default {
  authAPI,
  adminAPI,
  callsAPI,
  getStoredToken,
  getStoredUser,
  setStoredSession,
  clearStoredSession,
};
