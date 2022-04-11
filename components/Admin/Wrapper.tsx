import { Container } from "@mui/material";
import AdminContractProvider from "contexts/admin-contract";
import MetamaskProvider from "contexts/metamask";
import QueryClientProvider from "contexts/query-client-provider";
import { GetStaticPropsContext } from "next";

export interface AdminWrapperProps {
  contractAddress: string;
  explorerLink: string;
  rpcProvider: string;
}
const AdminWrapper: React.FC<AdminWrapperProps> = (props) => {
  return (
    <QueryClientProvider>
      <MetamaskProvider>
        <AdminContractProvider
          contractAddress={props.contractAddress}
          rpcProvider={props.rpcProvider}
        >
          <Container maxWidth="md" sx={{ py: 10 }}>{props.children}</Container>
        </AdminContractProvider>
      </MetamaskProvider>
    </QueryClientProvider>
  );
};

export default AdminWrapper;
