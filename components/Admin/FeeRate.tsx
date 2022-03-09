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
    <div>
      <label htmlFor="feeRate">Fee Rate:</label>
      <input
        type="text"
        value={feeRate}
        onChange={(e) => setFeeRate(e.target.value)}
        disabled={isFetching}
        name="feeRate"
      />
      <button disabled={isFetching} onClick={handleUpdate}>
        Update
      </button>
      {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
    </div>
  );
};

export default FeeRate;
