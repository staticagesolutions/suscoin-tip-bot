import { Box, Typography } from "@mui/material";
import { useAdminContract } from "contexts/admin-contract";
import AirdropRate from "./AirdropRate";
import FeeRate from "./FeeRate";

const AdminPanel: React.FC = () => {
  const { adminCount } = useAdminContract();

  return (
    <Box>
      <FeeRate />
      <AirdropRate />
    </Box>
  );
};

export default AdminPanel;
