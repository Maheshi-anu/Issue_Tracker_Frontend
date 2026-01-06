import { Chip, Tooltip } from '@mui/material';

interface SeverityBadgeProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const severityConfig = {
  low: { label: 'Low', color: '#6c757d', tooltip: 'Low severity - minimal impact' },
  medium: { label: 'Medium', color: '#ffc107', tooltip: 'Medium severity - moderate impact' },
  high: { label: 'High', color: '#fd7e14', tooltip: 'High severity - significant impact' },
  critical: { label: 'Critical', color: '#dc3545', tooltip: 'Critical severity - severe impact requiring immediate action' },
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityConfig[severity];
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

