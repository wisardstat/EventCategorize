// API utility functions with automatic Bearer token authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Generic fetch function with authentication
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if no token found
    window.location.href = '/login';
    throw new Error('No authentication token found');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Merge headers, allowing options.headers to override defaults
  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string> || {}),
  };

  // Handle FormData - remove Content-Type header to let browser set it automatically
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Authentication expired');
    }

    return response;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// GET request with authentication
export const getWithAuth = (endpoint: string) => {
  return fetchWithAuth(endpoint, { method: 'GET' });
};

// POST request with authentication
export const postWithAuth = (endpoint: string, data?: any) => {
  return fetchWithAuth(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// POST request without authentication (for login)
export const postWithoutAuth = (endpoint: string, data?: any) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  };

  return fetch(url, config);
};

// PUT request with authentication
export const putWithAuth = (endpoint: string, data?: any) => {
  return fetchWithAuth(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// DELETE request with authentication
export const deleteWithAuth = (endpoint: string) => {
  return fetchWithAuth(endpoint, { method: 'DELETE' });
};

// POST request with FormData (for file uploads)
export const postWithAuthFormData = (endpoint: string, formData: FormData) => {
  return fetchWithAuth(endpoint, {
    method: 'POST',
    body: formData,
  });
};

// PUT request with FormData (for file uploads)
export const putWithAuthFormData = (endpoint: string, formData: FormData) => {
  return fetchWithAuth(endpoint, {
    method: 'PUT',
    body: formData,
  });
};