import api from './axios';
import { Issue, IssuesResponse } from '../types';

export const issueApi = {
  getIssues: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    severity?: string;
    assigned_to?: number | 'unassigned';
    created_by?: number;
    sort_by?: 'created_at' | 'due_date';
    sort_order?: 'ASC' | 'DESC';
  }): Promise<IssuesResponse> => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  getIssueById: async (id: number): Promise<Issue> => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  createIssue: async (data: {
    title: string;
    description?: string;
    severity?: string;
    priority?: string;
    assigned_to?: number;
    due_date?: string;
  }): Promise<Issue> => {
    const response = await api.post('/issues', data);
    return response.data;
  },

  updateIssue: async (id: number, data: Partial<Issue>): Promise<Issue> => {
    const response = await api.put(`/issues/${id}`, data);
    return response.data;
  },

  changeIssueStatus: async (id: number, status: string): Promise<Issue> => {
    const response = await api.patch(`/issues/${id}/status`, { status });
    return response.data;
  },

  deleteIssue: async (id: number): Promise<void> => {
    await api.delete(`/issues/${id}`);
  },

  exportIssues: async (format: 'json' | 'csv', params?: {
    status?: string;
    priority?: string;
    severity?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<Blob> => {
    const response = await api.get('/issues/export', {
      params: { format, ...params },
      responseType: 'blob',
    });
    return response.data;
  },
};

