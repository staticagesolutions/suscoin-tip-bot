import { createContext, useContext, useEffect, useState } from "react";
import { useMetamask } from "./metamask";
import TipBot from "@contracts/TipBot.json";
import { AbiItem } from "web3-utils";

import Web3 from "web3";
import { useQuery, UseQueryResult } from "react-query";
import { TransactionConfig } from "web3-core";

const httpProvider = new Web3.providers.HttpProvider(
  "https://rpc.syscoin.org/"
);
const web3 = new Web3(httpProvider);

const contractAddress = "0x0B5ba273F261DA89a6D68f29f84a2D9DD4f6C38c";

const contract = new web3.eth.Contract(
  TipBot.abi as unknown as AbiItem,
  contractAddress
);

interface AdminContext {
  isAdmin: boolean;
  isFetching: boolean;
  adminCount: UseQueryResult<string, string>;
  getFeeRate: () => Promise<string>;
  updateFeeRate: (feeRateInEther: string) => Promise<string>;
  getAirdropRate: () => Promise<string>;
  updateAirdropRate: (feeRateInEther: string) => Promise<string>;
}

const AdminContext = createContext({} as AdminContext);

export const useAdminContract = () => useContext(AdminContext);

const AdminContractProvider: React.FC = ({ children }) => {
  const { account, sendTransaction } = useMetamask();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [adminRole, setAdminRole] = useState<string | undefined>();
  const adminCount = useQuery<string, string>("admin", {
    queryFn: () => contract.methods.getRoleMemberCount(adminRole).call(),
    enabled: adminRole !== undefined,
  });

  useEffect(() => {
    if (!account) {
      return;
    }
    setIsFetching(true);
    contract.methods
      .hasRole(adminRole, account)
      .call()
      .then(setIsAdmin)
      .then(() => setIsFetching(false));
  }, [account, adminRole]);

  useEffect(() => {
    contract.methods.DEFAULT_ADMIN_ROLE().call().then(setAdminRole);
  }, [setAdminRole]);

  const getFeeRate = (): Promise<string> =>
    contract.methods
      .feeRate()
      .call()
      .then((feeRateInWei: string) => web3.utils.fromWei(`${feeRateInWei}`));

  const updateFeeRate = (feeRateInEther: string) => {
    const feeRateInWei = web3.utils.toWei(feeRateInEther);
    const data = contract.methods.setFeeRate(feeRateInWei).encodeABI();
    const transactionParameters: TransactionConfig = {
      to: contractAddress,
      from: account,
      value: "0x00",
      data,
    };
    return sendTransaction(transactionParameters);
  };

  const getAirdropRate = (): Promise<string> =>
    contract.methods
      .airdropRate()
      .call()
      .then((feeRateInWei: string) => web3.utils.fromWei(`${feeRateInWei}`));

  const updateAirdropRate = (feeRateInEther: string) => {
    const feeRateInWei = web3.utils.toWei(feeRateInEther);
    const data = contract.methods.setAirdropRate(feeRateInWei).encodeABI();
    const transactionParameters: TransactionConfig = {
      to: contractAddress,
      from: account,
      value: "0x00",
      data,
    };
    return sendTransaction(transactionParameters);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isFetching,
        adminCount,
        getFeeRate,
        getAirdropRate,
        updateFeeRate,
        updateAirdropRate,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContractProvider;
