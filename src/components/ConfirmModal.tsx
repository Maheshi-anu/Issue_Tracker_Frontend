import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
}: ConfirmModalProps) {
  const getColor = () => {
    if (type === 'danger') return 'error';
    if (type === 'warning') return 'warning';
    return 'primary';
  };

  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: '#111827' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#4b5563', fontSize: '0.9375rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{ textTransform: 'none' }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={getColor()}
          variant="contained"
          sx={{ textTransform: 'none' }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

