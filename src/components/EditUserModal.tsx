import { useState, useEffect, FormEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
} from '@mui/material';
import { User } from '../types';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  currentUserId?: number;
  onClose: () => void;
  onSave: (data: {
    fname: string | null;
    lname: string | null;
    role?: 'admin' | 'user';
    status?: 'active' | 'invited' | 'inactive';
  }) => Promise<void>;
}

export default function EditUserModal({
  isOpen,
  user,
  currentUserId,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [status, setStatus] = useState<'active' | 'invited' | 'inactive'>('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFname(user.fname || '');
      setLname(user.lname || '');
      setRole(user.role);
      setStatus(user.status || 'active');
    }
  }, [user]);

  if (!user) return null;

  const isOwnAccount = user.id === currentUserId;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: {
        fname: string | null;
        lname: string | null;
        role?: 'admin' | 'user';
        status?: 'active' | 'invited' | 'inactive';
      } = {
        fname: fname || null,
        lname: lname || null,
      };

      if (!isOwnAccount) {
        data.role = role;
        data.status = status;
      }

      await onSave(data);
      onClose();
    } catch (err) {
      // error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: '#111827' }}>Edit User</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              disabled={loading}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Last Name"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              disabled={loading}
              variant="outlined"
            />
            <FormControl fullWidth disabled={loading || isOwnAccount}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
              {isOwnAccount && (
                <FormHelperText>Cannot change your own role</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth disabled={loading || isOwnAccount}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as 'active' | 'invited' | 'inactive')}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="invited">Invited</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
              {isOwnAccount && (
                <FormHelperText>Cannot change your own status</FormHelperText>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

