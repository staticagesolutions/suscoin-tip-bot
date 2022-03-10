import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useAdminContract } from "contexts/admin-contract";
import { useEffect, useState } from "react";

const FeeRate: React.FC = () => {
  const { getFeeRate, updateFeeRate } = useAdminContract();
  const [feeRate, setFeeRate] = useState("0");
  const [isFetching, setIsFetching] = useState(true);
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    getFeeRate().then((feeRateInEther) => {
      setFeeRate(feeRateInEther);
      setIsFetching(false);
    });
  }, [getFeeRate]);

  const handleUpdate = () => {
    updateFeeRate(feeRate).then((transactionHash) => {
      setTransactionHash(transactionHash);
    });
  };

  return (
    <Box  sx={{ mb: 2 }}>
      <Box display="flex">
        <TextField
          value={feeRate}
          onChange={(e) => setFeeRate(e.target.value)}
          disabled={isFetching}
          name="feeRate"
          label="Fee Rate:"
          type="number"
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
      </Box>
      {transactionHash && (
        <Typography variant="caption">
          Transaction Hash: {transactionHash}
        </Typography>
      )}
    </Box>
  );
};

export default FeeRate;
