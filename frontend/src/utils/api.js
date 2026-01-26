/**
 * API client utility
 * Handles HTTP requests to backend with auth headers
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - Response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Parse JSON response
  const data = await response.json();

  // Handle errors
  if (!response.ok) {
    throw new APIError(
      data.error?.message || 'An error occurred',
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.details || {},
      response.status
    );
  }

  return data;
}

/**
 * Custom API error class
 */
export class APIError extends Error {
  constructor(message, code, details, status) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

/**
 * API endpoint helpers
 */
export const api = {
  // Auth endpoints
  auth: {
    register: (data) => apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    login: (data) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    me: () => apiRequest('/auth/me'),
  },

  // Beta signup
  beta: {
    signup: (email) => apiRequest('/beta/signup', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  },
};
