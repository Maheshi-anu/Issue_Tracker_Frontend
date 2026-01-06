import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  IconButton,
  Pagination,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchUsers, inviteUser, updateUser, deleteUser, setSearch, setPage } from '../store/slices/userSlice';
import { showError, showSuccess } from '../utils/toast';
import ConfirmModal from '../components/ConfirmModal';
import InviteUserModal from '../components/InviteUserModal';
import EditUserModal from '../components/EditUserModal';
import { User } from '../types';

export default function Users() {
  const dispatch = useAppDispatch();
  const { users, pagination, search, loading } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    dispatch(fetchUsers({
      page: pagination.page,
      limit: pagination.limit,
      search: search || undefined,
    }));
  }, [dispatch, pagination.page, search]);

  const handleSearchChange = (value: string) => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    const timeout = setTimeout(() => {
      dispatch(setSearch(value));
    }, 500);
    setSearchDebounce(timeout);
  };

  const handleInvite = async (email: string, fname: string, lname: string, role: 'admin' | 'user') => {
    try {
      const result = await dispatch(inviteUser({ email, fname, lname, role })).unwrap();

      if (result.warning) {
        showError(`Invitation created but email failed: ${result.warning}`);
        if (result.invitation_link) {
          console.log('Invitation link (manual send):', result.invitation_link);
        }
      } else {
        showSuccess(result.message || 'Invitation sent successfully');
      }

      dispatch(fetchUsers({
        page: 1,
        limit: pagination.limit,
        search: search || undefined,
      }));
    } catch (err: any) {
      showError(err);
      throw err;
    }
  };


  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (data: {
    fname: string | null;
    lname: string | null;
    role?: 'admin' | 'user';
    status?: 'active' | 'invited' | 'inactive';
  }) => {
    if (!editingUser) return;

    try {
      await dispatch(updateUser({
        id: editingUser.id,
        data,
      })).unwrap();
      showSuccess('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      dispatch(fetchUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
      }));
    } catch (err: any) {
      showError(err);
      throw err;
    }
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await dispatch(deleteUser(userToDelete)).unwrap();
      showSuccess('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err: any) {
      showError(err);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'invited') return 'warning';
    return 'default';
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'primary' : 'default';
  };

  return (
    <Box className="w-full">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1" className="font-semibold text-gray-900">
          User Management
        </Typography>
        <Button variant="contained" onClick={() => setShowInviteModal(true)} className="normal-case">
          Invite User
        </Button>
      </Box>

      <Paper className="p-4 mb-6">
        <TextField
          fullWidth
          placeholder="Search users by email..."
          onChange={(e) => handleSearchChange(e.target.value)}
          size="small"
        />
      </Paper>

      {loading ? (
        <Box className="flex justify-center py-8">
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Paper className="p-8 text-center">
          <Typography variant="h6" className="text-gray-500">
            No users found
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const isOwnAccount = user.id === currentUser?.id;
                  const fullName = [user.fname, user.lname].filter(Boolean).join(' ') || 'N/A';
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'admin' ? 'Admin' : 'User'}
                          size="small"
                          color={getRoleColor(user.role)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            user.status === 'invited'
                              ? 'Invited'
                              : user.status === 'inactive'
                                ? 'Inactive'
                                : 'Active'
                          }
                          size="small"
                          color={getStatusColor(user.status || 'active')}
                        />
                      </TableCell>
                      <TableCell>{new Date(user.created_at || '').toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit user">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(user)}
                              color="primary"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={isOwnAccount ? 'Cannot delete your own account' : 'Delete user'}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(user.id)}
                                disabled={isOwnAccount}
                                color="error"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.pages > 1 && (
            <Box className="flex justify-center mt-6">
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={(_, page) => dispatch(setPage(page))}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />

      <EditUserModal
        isOpen={showEditModal}
        user={editingUser}
        currentUserId={currentUser?.id}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />
    </Box>
  );
}

