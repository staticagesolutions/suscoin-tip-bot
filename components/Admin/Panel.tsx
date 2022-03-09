import { useAdminContract } from "contexts/admin-contract";
import { useEffect, useState } from "react";
import AirdropRate from "./AirdropRate";
import FeeRate from "./FeeRate";

const AdminPanel: React.FC = () => {
  const { adminCount } = useAdminContract();

  return (
    <div>
      Admin Count: {adminCount.isLoading ? "Loading..." : adminCount.data}
      <FeeRate />
      <AirdropRate />
    </div>
  );
};

export default AdminPanel;
