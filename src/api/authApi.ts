import api from './axios';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  forgotPassword: async (email: string): Promise<{ message: string; warning?: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
  acceptInvitation: async (token: string, password: string) => {
    const response = await api.post('/auth/accept-invitation', { token, password });
    return response.data;
  },
};

