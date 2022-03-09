import { Box, Skeleton, Typography } from "@mui/material";
import { useAdminContract } from "contexts/admin-contract";

const AdminBalance: React.FC = () => {
  const { balance } = useAdminContract();
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2">Balance:</Typography>
      {balance.isLoading ? (
        <Skeleton />
      ) : (
        <Typography variant="body1">{balance.data} SYS</Typography>
      )}
    </Box>
  );
};

export default AdminBalance;
