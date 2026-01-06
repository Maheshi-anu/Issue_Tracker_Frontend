import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Grid,
  IconButton,
  Divider,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createIssue, updateIssue, fetchIssueById, clearCurrentIssue, changeIssueStatus } from '../store/slices/issueSlice';
import { userApi } from '../api/userApi';
import { User } from '../types';
import { showError, showSuccess } from '../utils/toast';
import ConfirmModal from './ConfirmModal';

interface IssueFormDrawerProps {
  open: boolean;
  onClose: () => void;
  issueId?: number | null;
  onSuccess?: () => void;
}

export default function IssueFormDrawer({ open, onClose, issueId, onSuccess }: IssueFormDrawerProps) {
  const dispatch = useAppDispatch();
  const { currentIssue } = useAppSelector((state) => state.issues);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [status, setStatus] = useState<'open' | 'in_progress' | 'resolved' | 'closed'>('open');
  const [dueDate, setDueDate] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      if (issueId) {
        dispatch(fetchIssueById(issueId));
      } else {
        setTitle('');
        setDescription('');
        setSeverity('medium');
        setPriority('medium');
        setAssignedTo(null);
        setStatus('open');
        setDueDate('');
        setError('');
        dispatch(clearCurrentIssue());
      }
    }
  }, [open, issueId, dispatch]);

  useEffect(() => {
    if (currentIssue && issueId) {
      setTitle(currentIssue.title);
      setDescription(currentIssue.description || '');
      setSeverity(currentIssue.severity);
      setPriority(currentIssue.priority);
      setAssignedTo(currentIssue.assigned_to);
      setStatus(currentIssue.status);
      setDueDate(currentIssue.due_date ? currentIssue.due_date.split('T')[0] : '');
    }
  }, [currentIssue, issueId]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userApi.getUsers({ limit: 100 });
        setUsers(response.users);
      } catch (err) {
        // Error loading users
      }
    };
    if (open) {
      loadUsers();
    }
  }, [open]);

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setPriority('medium');
    setAssignedTo(null);
    setStatus('open');
    setDueDate('');
    setError('');
    dispatch(clearCurrentIssue());
    onClose();
  };

  const saveIssue = async () => {
    setLoading(true);
    setError('');

    try {
      if (issueId) {
        const updates: Promise<unknown>[] = [];

        updates.push(
          dispatch(updateIssue({
            id: issueId,
            data: {
              title,
              description,
              severity,
              priority,
              assigned_to: assignedTo,
              due_date: dueDate || undefined,
            },
          })).unwrap()
        );

        if (currentIssue && status !== currentIssue.status) {
          updates.push(
            dispatch(
              changeIssueStatus({
                id: issueId,
                status,
              })
            ).unwrap()
          );
        }

        await Promise.all(updates);
        showSuccess('Issue updated successfully');
      } else {
        await dispatch(createIssue({
          title,
          description,
          severity,
          priority,
          assigned_to: assignedTo || undefined,
          due_date: dueDate || undefined,
        })).unwrap();
        showSuccess('Issue created successfully');
      }
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save issue';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      issueId &&
      currentIssue &&
      status !== currentIssue.status &&
      (status === 'resolved' || status === 'closed')
    ) {
      setShowStatusConfirm(true);
      return;
    }

    void saveIssue();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '500px', md: '600px' },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 3,
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
            {issueId ? 'Edit Issue' : 'Create Issue'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            padding: 3,
          }}
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setTitle(e.target.value);
                  }
                }}
                required
                disabled={loading}
                variant="outlined"
                inputProps={{ maxLength: 200 }}
                helperText={`${title.length}/200 characters`}
              />
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 2000) {
                    setDescription(e.target.value);
                  }
                }}
                disabled={loading}
                multiline
                rows={5}
                variant="outlined"
                inputProps={{ maxLength: 2000 }}
                helperText={`${description.length}/2000 characters`}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Severity</InputLabel>
                    <Select
                      value={severity}
                      label="Severity"
                      onChange={(e) => setSeverity(e.target.value as any)}
                      disabled={loading}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={priority}
                      label="Priority"
                      onChange={(e) => setPriority(e.target.value as any)}
                      disabled={loading}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {issueId && (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value as any)}
                    disabled={loading}
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              )}
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={assignedTo || ''}
                  label="Assign To"
                  onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : null)}
                  disabled={loading}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </form>
        </Box>

        <Divider />
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
            padding: 3,
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <Button
            type="button"
            onClick={handleClose}
            variant="outlined"
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ textTransform: 'none' }}
            onClick={handleSubmit}
          >
            {loading ? 'Saving...' : issueId ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
      <ConfirmModal
        isOpen={showStatusConfirm}
        title="Confirm Status Change"
        message={
          status === 'closed'
            ? 'Are you sure you want to close this issue?'
            : 'Are you sure you want to mark this issue as resolved?'
        }
        confirmText="Yes, update"
        cancelText="Cancel"
        onConfirm={() => {
          setShowStatusConfirm(false);
          void saveIssue();
        }}
        onCancel={() => setShowStatusConfirm(false)}
        type="warning"
      />
    </Drawer>
  );
}

