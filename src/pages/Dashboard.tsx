import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchIssues, setFilters, setPage } from '../store/slices/issueSlice';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SeverityBadge from '../components/SeverityBadge';
import ExportIssuesModal from '../components/ExportIssuesModal';
import IssueFormDrawer from '../components/IssueFormDrawer';
import IssueDetailDrawer from '../components/IssueDetailDrawer';
import { issueApi } from '../api/issueApi';
import { userApi } from '../api/userApi';
import { User } from '../types';
import { showError, showSuccess } from '../utils/toast';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { issues, counts, pagination, filters, loading } = useAppSelector((state) => state.issues);
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showIssueDrawer, setShowIssueDrawer] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState<number | null>(null);
  const [viewingIssueId, setViewingIssueId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    dispatch(fetchIssues({
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      severity: filters.severity || undefined,
      assigned_to: filters.assigned_to || undefined,
      created_by: filters.created_by || undefined,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    }));
  }, [dispatch, pagination.page, filters]);

  const handleSearchChange = (value: string) => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    const timeout = setTimeout(() => {
      dispatch(setFilters({ search: value }));
    }, 500);
    setSearchDebounce(timeout);
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'assigned_to') {
      if (value === '') {
        dispatch(setFilters({ assigned_to: null }));
      } else {
        dispatch(setFilters({ assigned_to: value as any }));
      }
    } else {
      dispatch(setFilters({ [key]: value || '' }));
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userApi.getUsers({ limit: 100 });
        setUsers(response.users);
      } catch (err) {
        // Error loading users
      }
    };
    loadUsers();
  }, []);

  const handleExport = async (format: 'json' | 'csv', fromDate: string, toDate: string) => {
    try {
      const blob = await issueApi.exportIssues(format, {
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        severity: filters.severity || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `issues.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess(`Issues exported as ${format.toUpperCase()} successfully`);
    } catch (error: any) {
      showError(error.response?.data?.error || 'Export failed');
      throw error;
    }
  };

  const handleCreateIssue = () => {
    setEditingIssueId(null);
    setShowIssueDrawer(true);
  };

  const handleIssueSuccess = () => {
    dispatch(fetchIssues({
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      severity: filters.severity || undefined,
      assigned_to: filters.assigned_to || undefined,
      created_by: filters.created_by || undefined,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    }));
  };

  const handleViewIssue = (issueId: number) => {
    setViewingIssueId(issueId);
    setShowDetailDrawer(true);
  };

  const handleEditIssue = (issueId: number) => {
    setEditingIssueId(issueId);
    setShowIssueDrawer(true);
    setShowDetailDrawer(false);
  };

  const handleIssueDelete = () => {
    setShowDetailDrawer(false);
    setViewingIssueId(null);
    handleIssueSuccess();
  };

  const handleSort = (field: 'created_at' | 'due_date') => {
    if (filters.sort_by === field) {
      dispatch(setFilters({ sort_order: filters.sort_order === 'ASC' ? 'DESC' : 'ASC' }));
    } else {
      dispatch(setFilters({ sort_by: field, sort_order: 'DESC' }));
    }
  };

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return { status: 'none', color: '', icon: null };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', color: '#dc3545', icon: <ErrorIcon sx={{ fontSize: 16, mr: 0.5, color: '#dc3545' }} /> };
    } else if (diffDays <= 3) {
      return { status: 'warning', color: '#ff9800', icon: <WarningIcon sx={{ fontSize: 16, mr: 0.5, color: '#ff9800' }} /> };
    }
    return { status: 'normal', color: '', icon: null };
  };

  return (
    <Box className="w-full">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1" className="font-semibold text-gray-900">
          Issues
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => setShowExportModal(true)}
            className="normal-case"
          >
            Export Issues
          </Button>
          <Button
            onClick={handleCreateIssue}
            variant="contained"
            className="normal-case"
          >
            Create Issue
          </Button>
        </Stack>
      </Box>

      <ExportIssuesModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      <Grid container spacing={2} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-green-600 text-white">
            <CardContent>
              <Typography variant="h4" className="font-semibold">
                {counts.open}
              </Typography>
              <Typography variant="body2">Open</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-blue-600 text-white">
            <CardContent>
              <Typography variant="h4" className="font-semibold">
                {counts.in_progress}
              </Typography>
              <Typography variant="body2">In Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-cyan-600 text-white">
            <CardContent>
              <Typography variant="h4" className="font-semibold">
                {counts.resolved}
              </Typography>
              <Typography variant="body2">Resolved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gray-600 text-white">
            <CardContent>
              <Typography variant="h4" className="font-semibold">
                {counts.closed}
              </Typography>
              <Typography variant="body2">Closed</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper className="p-4 mb-6">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search issues..."
              onChange={(e) => handleSearchChange(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity}
                label="Severity"
                onChange={(e) => handleFilterChange('severity', e.target.value)}
              >
                <MenuItem value="">All Severities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={filters.assigned_to || ''}
                label="Assigned To"
                onChange={(e) => handleFilterChange('assigned_to', String(e.target.value))}
              >
                <MenuItem value="">All Users</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    {[user.fname, user.lname].filter(Boolean).join(' ') || user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box className="flex justify-center py-8">
          <CircularProgress />
        </Box>
      ) : issues.length === 0 ? (
        <Paper className="p-8 text-center">
          <Typography variant="h6" className="text-gray-500">
            No issues found
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper className="mb-4">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Severity</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Assigned To</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        py: 2,
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      }}
                      onClick={() => handleSort('due_date')}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <span>Due Date</span>
                        {filters.sort_by === 'due_date' ? (
                          filters.sort_order === 'ASC' ? (
                            <ArrowUpward sx={{ fontSize: 16, color: 'primary.main' }} />
                          ) : (
                            <ArrowDownward sx={{ fontSize: 16, color: 'primary.main' }} />
                          )
                        ) : (
                          <ArrowDownward sx={{ fontSize: 16, color: '#9ca3af' }} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        py: 2,
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      }}
                      onClick={() => handleSort('created_at')}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <span>Created At</span>
                        {filters.sort_by === 'created_at' ? (
                          filters.sort_order === 'ASC' ? (
                            <ArrowUpward sx={{ fontSize: 16, color: 'primary.main' }} />
                          ) : (
                            <ArrowDownward sx={{ fontSize: 16, color: 'primary.main' }} />
                          )
                        ) : (
                          <ArrowDownward sx={{ fontSize: 16, color: '#9ca3af' }} />
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow
                      key={issue.id}
                      hover
                      onClick={() => handleViewIssue(issue.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ py: 1.5 }}>{issue.id}</TableCell>
                      <TableCell sx={{ maxWidth: 320, py: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {issue.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <StatusBadge status={issue.status} />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <PriorityBadge priority={issue.priority} />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <SeverityBadge severity={issue.severity} />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {issue.assigned_to_email || 'Unassigned'}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {(() => {
                          const dueDateStatus = getDueDateStatus(issue.due_date);
                          if (!issue.due_date) {
                            return <Typography variant="body2" sx={{ color: '#6b7280' }}>Not set</Typography>;
                          }
                          return (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              {dueDateStatus.icon}
                              <Typography
                                variant="body2"
                                sx={{
                                  color: dueDateStatus.color || 'inherit',
                                  fontWeight: dueDateStatus.status !== 'normal' ? 500 : 400,
                                }}
                              >
                                {new Date(issue.due_date).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          );
                        })()}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {new Date(issue.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

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

      <IssueFormDrawer
        open={showIssueDrawer}
        onClose={() => {
          setShowIssueDrawer(false);
          setEditingIssueId(null);
        }}
        issueId={editingIssueId}
        onSuccess={handleIssueSuccess}
      />

      <IssueDetailDrawer
        open={showDetailDrawer}
        onClose={() => {
          setShowDetailDrawer(false);
          setViewingIssueId(null);
        }}
        issueId={viewingIssueId}
        onEdit={handleEditIssue}
        onDelete={handleIssueDelete}
      />
    </Box>
  );
}

