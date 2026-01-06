import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userApi } from '../../api/userApi';
import { User, UsersResponse } from '../../types';

interface UserState {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  search: string;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  search: '',
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await userApi.getUsers(params);
    return response;
  }
);

export const inviteUser = createAsyncThunk(
  'users/inviteUser',
  async ({ email, fname, lname, role }: { email: string; fname: string; lname: string; role: 'admin' | 'user' }) => {
    const response = await userApi.inviteUser(email, fname, lname, role);
    return response.data;
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: number; data: { fname?: string | null; lname?: string | null; role?: string; status?: string } }) => {
    await userApi.updateUser(id, data);
    return { id, ...data };
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: number) => {
    await userApi.deleteUser(id);
    return id;
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<UsersResponse>) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(inviteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(inviteUser.fulfilled, (state) => {
        state.loading = false;
        state.pagination.page = 1;
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to invite user';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            fname: action.payload.fname !== undefined ? action.payload.fname : state.users[index].fname,
            lname: action.payload.lname !== undefined ? action.payload.lname : state.users[index].lname,
            role: action.payload.role as 'admin' | 'user' || state.users[index].role,
            status: action.payload.status as 'active' | 'invited' | 'inactive' || state.users[index].status,
          };
        }
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const { setSearch, setPage } = userSlice.actions;
export default userSlice.reducer;

