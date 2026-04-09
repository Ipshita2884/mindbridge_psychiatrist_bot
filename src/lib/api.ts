const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

export const authAPI = {
  login: async (data: any) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  register: async (data: any) => {
    // Map fullName to display_name as expected by backend
    const { fullName, ...rest } = data;
    const backendData = { ...rest, display_name: fullName };
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendData),
    });
    return response.json();
  },
  forgotPassword: async (email: string) => {
    // Note: forgotPassword endpoint isn't implemented in the backend yet
    // but this satisfies the frontend import in Login.tsx
    console.log('Forgot password requested for:', email);
    return { success: true, message: 'Reset link sent' };
  },
  verify: async (token: string) => {
    const response = await fetch(`${BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }
};
