import { useState, FormEvent } from "react";
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
  Alert,
  Box,
} from "@mui/material";

interface ExportIssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (
    format: "json" | "csv",
    fromDate: string,
    toDate: string
  ) => Promise<void>;
}

export default function ExportIssuesModal({
  isOpen,
  onClose,
  onExport,
}: ExportIssuesModalProps) {
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("From date must be before or equal to To date");
      setLoading(false);
      return;
    }

    try {
      await onExport(format, fromDate, toDate);
      setFromDate("");
      setToDate("");
      setFormat("json");
      onClose();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error || err?.message || "Export failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: "#111827" }}>
        Export Issues
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty to export all issues from the beginning"
            />
            <TextField
              fullWidth
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty to export all issues until now"
            />
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={format}
                label="Format"
                onChange={(e) => setFormat(e.target.value as "json" | "csv")}
                disabled={loading}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            {loading ? "Exporting..." : "Export"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
