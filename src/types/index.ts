export interface User {
  id: number;
  email: string;
  fname?: string | null;
  lname?: string | null;
  role: 'admin' | 'user';
  status?: 'active' | 'invited' | 'inactive';
  created_at?: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_by: number;
  assigned_to: number | null;
  due_date: string | null;
  created_by_email?: string;
  assigned_to_email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface IssueCounts {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface IssuesResponse {
  issues: Issue[];
  pagination: Pagination;
  counts: IssueCounts;
}

export interface UsersResponse {
  users: User[];
  pagination: Pagination;
}

