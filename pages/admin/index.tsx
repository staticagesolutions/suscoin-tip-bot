import { useCallback, useEffect, useState } from "react";

import Web3 from "web3";
import { AbiItem } from "web3-utils";

import TipBot from "@contracts/TipBot.json";
import MetamaskProvider, { useMetamask } from "contexts/metamask";
import AdminContractProvider, {
  useAdminContract,
} from "contexts/admin-contract";
import AdminPanel from "components/Admin/Panel";
import QueryClientProvider from "contexts/query-client-provider";

const Admin: React.FC = () => {
  const {
    isEnabled: isMetamaskEnabled,
    requestAccounts,
    account,
  } = useMetamask();
  const { isAdmin } = useAdminContract();

  if (!isMetamaskEnabled) {
    return <>Metamask not installed</>;
  }

  const handleConnext = () => {
    requestAccounts();
  };

  return (
    <div>
      {!account && <button onClick={handleConnext}>Connect</button>}
      <p>Logged as: {account}</p>
      {isAdmin && <AdminPanel />}
      {!isAdmin && isAdmin && <span>Not an admin</span>}
    </div>
  );
};

const AdminWrapper = () => {
  return (
    <QueryClientProvider>
      <MetamaskProvider>
        <AdminContractProvider>
          <Admin />
        </AdminContractProvider>
      </MetamaskProvider>
    </QueryClientProvider>
  );
};

export default AdminWrapper;
