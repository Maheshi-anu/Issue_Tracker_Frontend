import { Chip, Tooltip } from '@mui/material';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const priorityConfig = {
  low: { label: 'Low', color: '#6c757d', tooltip: 'Low priority - can be addressed when time permits' },
  medium: { label: 'Medium', color: '#ffc107', tooltip: 'Medium priority - should be addressed soon' },
  high: { label: 'High', color: '#fd7e14', tooltip: 'High priority - requires prompt attention' },
  urgent: { label: 'Urgent', color: '#dc3545', tooltip: 'Urgent priority - requires immediate attention' },
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
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

