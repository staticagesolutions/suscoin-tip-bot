import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Skeleton,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { WithdrawalRequest } from "@prisma/client";
import AdminWithdrawalRequestCreateDialog from "components/Admin/WithdrawalRequest/CreateDialog";
import AdminWrapper, { AdminWrapperProps } from "components/Admin/Wrapper";
import { useAdminContract } from "contexts/admin-contract";
import { useMetamask } from "contexts/metamask";
import { GetStaticPropsContext } from "next";
import { useState } from "react";
import { useQuery } from "react-query";

const columns: GridColDef[] = [
  {
    field: "id",
    headerName: "Id",
  },
  {
    field: "amount",
    headerName: "Amount",
  },
  {
    field: "createdAt",
    headerName: "Created At",
  },
  {
    field: "updatedAt",
    headerName: "Updated At",
  },
  {
    field: "status",
    headerName: "Status",
  },
  {
    field: "initator",
    headerName: "Initiator",
    width: 200,
  },
];

const AdminWithdrawalRequest: React.FC = () => {
  const { balance } = useAdminContract();
  const { account } = useMetamask();

  const { data } = useQuery<WithdrawalRequest[]>(["withdrawal-requests"], {
    queryFn: () =>
      fetch("/api/withdrawal-request", {
        method: "GET",
      }).then((res) => res.json()),
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  return (
    <Container>
      <Card>
        <CardContent>
          <Typography variant="h5">Withdrawal Requests</Typography>
          <Box display="flex">
            {balance.isLoading ? (
              <Skeleton />
            ) : (
              <>
                <Typography variant="body1" sx={{ lineHeight: "2.25rem" }}>
                  Balance: {balance.data} SYS
                </Typography>
                <Button
                  sx={{ ml: "auto" }}
                  onClick={() => setShowCreateForm(true)}
                  variant="contained"
                >
                  Create
                </Button>
              </>
            )}
          </Box>
          <Box>
            <DataGrid
              rows={data ?? []}
              columns={columns}
              autoHeight
              sortingMode="client"
            />
          </Box>
        </CardContent>
      </Card>
      {balance.data && account && (
        <AdminWithdrawalRequestCreateDialog
          maximum={parseFloat(balance.data)}
          initiator={account}
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </Container>
  );
};

const Wrapper = (props: AdminWrapperProps) => {
  return (
    <AdminWrapper {...props}>
      <AdminWithdrawalRequest />
    </AdminWrapper>
  );
};

export default Wrapper;

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {
      contractAddress: process.env.CONTRACT_ADDRESS!,
      explorerLink: process.env.EXPLORER_LINK!,
      rpcProvider: process.env.RPC_PROVIDER,
    },
  };
}
