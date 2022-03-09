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
    <div>
      <label htmlFor="airdropRate">Airdrop Rate:</label>
      <input
        type="text"
        value={airdropRate}
        onChange={(e) => setAirdropRate(e.target.value)}
        disabled={isFetching}
        name="airdropRate"
      />
      <button disabled={isFetching} onClick={handleUpdate}>
        Update
      </button>
      {transactionHash && <p>Update Airdrop: {transactionHash}</p>}
    </div>
  );
};

export default AirdropRate;
