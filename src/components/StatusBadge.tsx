import { Chip, Tooltip } from '@mui/material';

interface StatusBadgeProps {
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
}

const statusConfig = {
  open: { label: 'Open', color: '#28a745', tooltip: 'Issue is open and awaiting action' },
  in_progress: { label: 'In Progress', color: '#007bff', tooltip: 'Issue is currently being worked on' },
  resolved: { label: 'Resolved', color: '#17a2b8', tooltip: 'Issue has been resolved' },
  closed: { label: 'Closed', color: '#6c757d', tooltip: 'Issue is closed' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Tooltip title={config.tooltip} arrow>
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.color,
          color: 'white',
          fontWeight: 500,
        }}
      />
    </Tooltip>
  );
}

