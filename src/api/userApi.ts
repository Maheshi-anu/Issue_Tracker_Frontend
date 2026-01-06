import api from './axios';
import { User, UsersResponse } from '../types';

export const userApi = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<UsersResponse> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  inviteUser: async (email: string, fname: string, lname: string, role: 'admin' | 'user') => {
    const response = await api.post('/users/invite', { email, fname, lname, role });
    return response;
  },

  updateUser: async (id: number, data: {
    fname?: string | null;
    lname?: string | null;
    role?: string;
    status?: string;
  }): Promise<void> => {
    await api.put(`/users/${id}`, data);
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

