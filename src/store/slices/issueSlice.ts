import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { issueApi } from '../../api/issueApi';
import { Issue, IssuesResponse, IssueCounts } from '../../types';

interface IssueState {
  issues: Issue[];
  currentIssue: Issue | null;
  counts: IssueCounts;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    search: string;
    status: string;
    priority: string;
    severity: string;
    assigned_to: number | 'unassigned' | null;
    created_by: number | null;
    sort_by: 'created_at' | 'due_date';
    sort_order: 'ASC' | 'DESC';
  };
  loading: boolean;
  error: string | null;
}

const initialState: IssueState = {
  issues: [],
  currentIssue: null,
  counts: {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    search: '',
    status: '',
    priority: '',
    severity: '',
    assigned_to: null,
    created_by: null,
    sort_by: 'created_at',
    sort_order: 'DESC',
  },
  loading: false,
  error: null,
};

export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async (params?: {
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
  }) => {
    const response = await issueApi.getIssues(params);
    return response;
  }
);

export const fetchIssueById = createAsyncThunk(
  'issues/fetchIssueById',
  async (id: number) => {
    const issue = await issueApi.getIssueById(id);
    return issue;
  }
);

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (data: {
    title: string;
    description?: string;
    severity?: string;
    priority?: string;
    assigned_to?: number;
    due_date?: string;
  }) => {
    const issue = await issueApi.createIssue(data);
    return issue;
  }
);

export const updateIssue = createAsyncThunk(
  'issues/updateIssue',
  async ({ id, data }: { id: number; data: Partial<Issue> }) => {
    const issue = await issueApi.updateIssue(id, data);
    return issue;
  }
);

export const changeIssueStatus = createAsyncThunk(
  'issues/changeIssueStatus',
  async ({ id, status }: { id: number; status: string }) => {
    const issue = await issueApi.changeIssueStatus(id, status);
    return issue;
  }
);

export const deleteIssue = createAsyncThunk(
  'issues/deleteIssue',
  async (id: number) => {
    await issueApi.deleteIssue(id);
    return id;
  }
);

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<IssueState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action: PayloadAction<IssuesResponse>) => {
        state.loading = false;
        state.issues = action.payload.issues;
        state.counts = action.payload.counts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch issues';
      })
      .addCase(fetchIssueById.fulfilled, (state, action: PayloadAction<Issue>) => {
        state.currentIssue = action.payload;
      })
      .addCase(createIssue.fulfilled, (state) => {
        state.pagination.page = 1;
      })
      .addCase(updateIssue.fulfilled, (state, action: PayloadAction<Issue>) => {
        const index = state.issues.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.issues[index] = action.payload;
        }
        if (state.currentIssue?.id === action.payload.id) {
          state.currentIssue = action.payload;
        }
      })
      .addCase(changeIssueStatus.fulfilled, (state, action: PayloadAction<Issue>) => {
        const index = state.issues.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.issues[index] = action.payload;
        }
        if (state.currentIssue?.id === action.payload.id) {
          state.currentIssue = action.payload;
        }
      })
      .addCase(deleteIssue.fulfilled, (state, action: PayloadAction<number>) => {
        state.issues = state.issues.filter((i) => i.id !== action.payload);
      });
  },
});

export const { setFilters, setPage, clearCurrentIssue } = issueSlice.actions;
export default issueSlice.reducer;

