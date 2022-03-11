import { Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useAdminContract } from "contexts/admin-contract";
import { useMetamask } from "contexts/metamask";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";

interface AdminEditDialogProps {
  onClose: () => void;
  open: boolean;
  address: string;
}

const AdminEditDialog: React.FC<AdminEditDialogProps> = ({
  onClose,
  open,
  address,
}) => {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: () =>
      fetch(`/api/admin/${address}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries(["admin", "member", address]);
    },
  });

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    mutate();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Admin</DialogTitle>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          px: 3,
          pb: 3,
        }}
      >
        <TextField
          label="Name"
          sx={{ mb: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Address"
          aria-readonly
          disabled
          value={address}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button variant="text" color="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AdminEditDialog;
