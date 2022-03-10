import { Box, Button, TextField } from "@mui/material";
import { useAdminContract } from "contexts/admin-contract";
import { useEffect, useState } from "react";

const AirdropRate: React.FC = () => {
  const { getAirdropRate, updateAirdropRate } = useAdminContract();
  const [airdropRate, setAirdropRate] = useState("0");
  const [isFetching, setIsFetching] = useState(true);
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    getAirdropRate().then((feeRateInEther) => {
      setAirdropRate(feeRateInEther);
      setIsFetching(false);
    });
  }, [getAirdropRate]);

  const handleUpdate = () => {
    updateAirdropRate(airdropRate).then((transactionHash) =>
      setTransactionHash(transactionHash)
    );
  };

  return (
    <Box display="flex" sx={{ mb: 2 }}>
      <TextField
        type="number"
        value={airdropRate}
        onChange={(e) => setAirdropRate(e.target.value)}
        disabled={isFetching}
        name="airdropRate"
        label="Airdrop Rate:"
        sx={{ flex: 1 }}
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9].[0-9][0-9]*",
          max: 100,
          min: 0.1,
          step: 0.1,
        }}
      />
      <Button disabled={isFetching} onClick={handleUpdate}>
        Update
      </Button>
      {transactionHash && <p>Update Airdrop: {transactionHash}</p>}
    </Box>
  );
};

export default AirdropRate;
