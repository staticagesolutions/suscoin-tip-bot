import MetamaskProvider, { useMetamask } from "contexts/metamask";
import AdminContractProvider, {
  useAdminContract,
} from "contexts/admin-contract";
import AdminPanel from "components/Admin/Panel";
import QueryClientProvider from "contexts/query-client-provider";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import { GetStaticPropsContext } from "next";
import AdminList from "components/Admin/List";
import AdminBalance from "components/Admin/Balance";

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

  if (!account) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">
            Welcome to Syscoin TipBot Admin Page
          </Typography>
          <Typography variant="body1">
            This UI interacts with Metamask Wallet to perform admin operation
            and is only accessible by addresses gived by ADMIN Roles.
          </Typography>
        </CardContent>
        <CardActions>
          <Button onClick={handleConnext} variant="text" color="primary">
            Connect
          </Button>
        </CardActions>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <p>Logged as: {account}</p>
        <AdminBalance />
        <AdminPanel />
        <AdminList />
      </CardContent>
    </Card>
  );
};

interface AdminWrapperProps {
  contractAddress: string;
  explorerLink: string;
  rpcProvider: string;
}

const AdminWrapper = (props: AdminWrapperProps) => {
  return (
    <QueryClientProvider>
      <MetamaskProvider>
        <AdminContractProvider
          contractAddress={props.contractAddress}
          rpcProvider={props.rpcProvider}
        >
          <Container maxWidth="md" sx={{ py: 10 }}>
            <Admin />
          </Container>
        </AdminContractProvider>
      </MetamaskProvider>
    </QueryClientProvider>
  );
};

export default AdminWrapper;

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {
      contractAddress: process.env.CONTRACT_ADDRESS!,
      explorerLink: process.env.EXPLORER_LINK!,
      rpcProvider: process.env.RPC_PROVIDER,
    },
  };
}
