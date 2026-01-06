import { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
} from '@mui/material';
import { CheckOutlined, Close, CloseOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchIssueById, deleteIssue, clearCurrentIssue, changeIssueStatus } from '../store/slices/issueSlice';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SeverityBadge from '../components/SeverityBadge';
import ConfirmModal from '../components/ConfirmModal';
import IssueFormDrawer from './IssueFormDrawer';
import { showError, showSuccess } from '../utils/toast';

interface IssueDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  issueId: number | null;
  onEdit?: (issueId: number) => void;
  onDelete?: () => void;
}

export default function IssueDetailDrawer({ open, onClose, issueId, onEdit, onDelete }: IssueDetailDrawerProps) {
  const dispatch = useAppDispatch();
  const { currentIssue, loading } = useAppSelector((state) => state.issues);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'resolved' | 'closed' | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

  useEffect(() => {
    if (open && issueId) {
      dispatch(fetchIssueById(issueId));
    }
    return () => {
      if (!open) {
        dispatch(clearCurrentIssue());
      }
    };
  }, [open, issueId, dispatch]);

  const handleClose = () => {
    setShowEditDrawer(false);
    dispatch(clearCurrentIssue());
    onClose();
  };

  const handleDelete = async () => {
    if (!currentIssue) return;
    try {
      await dispatch(deleteIssue(currentIssue.id)).unwrap();
      showSuccess('Issue deleted successfully');
      handleClose();
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      showError(error.message || 'Failed to delete issue');
    }
  };

  const handleStatusChange = async (newStatus: 'resolved' | 'closed') => {
    if (!currentIssue) return;
    try {
      await dispatch(changeIssueStatus({ id: currentIssue.id, status: newStatus })).unwrap();
      showSuccess(`Issue marked as ${newStatus === 'resolved' ? 'resolved' : 'closed'}`);
      if (issueId) {
        dispatch(fetchIssueById(issueId));
      }
      setShowConfirm(false);
      setActionType(null);
    } catch (error: any) {
      showError(error.message || `Failed to mark issue as ${newStatus}`);
    }
  };

  const canEdit = !!currentIssue;

  return (
    <>
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
              Issue Details
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
            {loading && !currentIssue ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : !currentIssue ? (
              <Alert severity="error">Issue not found</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#111827' }}>
                    {currentIssue.title}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <StatusBadge status={currentIssue.status} />
                    <PriorityBadge priority={currentIssue.priority} />
                    <SeverityBadge severity={currentIssue.severity} />
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#111827' }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#4b5563' }}>
                    {currentIssue.description || 'No description provided'}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#111827' }}>
                    Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        <strong>Created By:</strong> {currentIssue.created_by_email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        <strong>Assigned To:</strong> {currentIssue.assigned_to_email || 'Unassigned'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        <strong>Created At:</strong> {new Date(currentIssue.created_at).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        <strong>Updated At:</strong> {new Date(currentIssue.updated_at).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: '#4b5563' }}>
                        <strong>Due Date:</strong> {currentIssue.due_date ? new Date(currentIssue.due_date).toLocaleDateString() : 'Not set'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </Box>

          {currentIssue && canEdit && (
            <>
              <Divider />
              <Box
                sx={{
                  padding: 3,
                  borderTop: '1px solid #e5e7eb',
                }}
              >
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                  {currentIssue.status !== 'resolved' && currentIssue.status !== 'closed' && (
                    <>
                      <Button
                        onClick={() => {
                          setActionType('resolved');
                          setShowConfirm(true);
                        }}
                        variant="outlined"
                        sx={{ textTransform: 'none' }}
                        startIcon={<CheckOutlined />}
                      >
                        Mark as Resolved
                      </Button>
                      <Button
                        onClick={() => {
                          setActionType('closed');
                          setShowConfirm(true);
                        }}
                        variant="outlined"
                        sx={{ textTransform: 'none' }}
                        startIcon={<CloseOutlined />}
                      >
                        Mark as Closed
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => {
                      if (onEdit && currentIssue) {
                        onEdit(currentIssue.id);
                      } else {
                        setShowEditDrawer(true);
                      }
                    }}
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                    startIcon={<EditOutlined />}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType('delete');
                      setShowConfirm(true);
                    }}
                    variant="contained"
                    color="error"
                    startIcon={<DeleteOutlined />}
                    sx={{ textTransform: 'none' }}
                  >
                    Delete
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Action"
        message={
          actionType === 'delete'
            ? 'Are you sure you want to delete this issue? This action cannot be undone.'
            : actionType === 'resolved'
              ? 'Are you sure you want to mark this issue as resolved?'
              : actionType === 'closed'
                ? 'Are you sure you want to close this issue?'
                : ''
        }
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={() => {
          if (actionType === 'delete') {
            handleDelete();
          } else if (actionType === 'resolved') {
            handleStatusChange('resolved');
          } else if (actionType === 'closed') {
            handleStatusChange('closed');
          }
        }}
        onCancel={() => {
          setShowConfirm(false);
          setActionType(null);
        }}
        type='danger'
      />

      {!onEdit && (
        <IssueFormDrawer
          open={showEditDrawer}
          onClose={() => setShowEditDrawer(false)}
          issueId={currentIssue?.id || null}
          onSuccess={() => {
            if (issueId) {
              dispatch(fetchIssueById(issueId));
            }
          }}
        />
      )}
    </>
  );
}

