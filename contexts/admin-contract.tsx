import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useMetamask } from "./metamask";
import TipBot from "@contracts/TipBot.json";
import { AbiItem } from "web3-utils";

import Web3 from "web3";
import { useQuery, UseQueryResult } from "react-query";
import { TransactionConfig } from "web3-core";

export type TransactionHash = string;
interface AdminContext {
  isAdmin: boolean;
  isFetching: boolean;
  adminCount: UseQueryResult<string, string>;
  roleMembers: UseQueryResult<string[]>;
  balance: UseQueryResult<string>;
  getFeeRate: () => Promise<string>;
  getAirdropRate: () => Promise<string>;
  updateFeeRate: (feeRateInEther: string) => Promise<TransactionHash>;
  updateAirdropRate: (feeRateInEther: string) => Promise<TransactionHash>;
  addAdmin: (address: string) => Promise<TransactionHash>;
  removeAdmin: (address: string) => Promise<TransactionHash>;
  getAdminAt: (index: number) => Promise<string>;
}

const AdminContext = createContext({} as AdminContext);

export const useAdminContract = () => useContext(AdminContext);

interface AdminContractProviderProps {
  contractAddress: string;
  rpcProvider: string;
}

const AdminContractProvider: React.FC<AdminContractProviderProps> = ({
  contractAddress,
  rpcProvider,
  children,
}) => {
  const web3 = useMemo(() => {
    const httpProvider = new Web3.providers.HttpProvider(rpcProvider);
    return new Web3(httpProvider);
  }, [rpcProvider]);
  const contract = useMemo(() => {
    return new web3.eth.Contract(
      TipBot.abi as unknown as AbiItem,
      contractAddress
    );
  }, [contractAddress, web3]);
  const { account, sendTransaction } = useMetamask();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [adminRole, setAdminRole] = useState<string | undefined>();
  const adminCount = useQuery<string, string>(["admin", "count"], {
    queryFn: () => contract.methods.getRoleMemberCount(adminRole).call(),
    enabled: adminRole !== undefined,
  });

  const roleMembers = useQuery<string[]>(["admin", "rolemembers"], {
    queryFn: async () => {
      const count = parseInt(adminCount.data!, 10);
      const members = await Promise.all(
        Array(count)
          .fill(1)
          .map((_, index) => getAdminAt(index))
      );
      return members;
    },
    enabled: adminCount.isFetched,
  });

  const balance = useQuery<string>(["admin", "balance"], {
    queryFn: () => {
      return web3.eth.getBalance(contractAddress).then(web3.utils.fromWei);
    },
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
  }, [account, adminRole, contract]);

  useEffect(() => {
    contract.methods.DEFAULT_ADMIN_ROLE().call().then(setAdminRole);
  }, [setAdminRole, contract]);

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

  const addAdmin = (address: string) => {
    const data = contract.methods.grantRole(adminRole, address).encodeABI();
    const transactionParameters: TransactionConfig = {
      to: contractAddress,
      from: account,
      value: "0x00",
      data,
    };
    return sendTransaction(transactionParameters);
  };

  const removeAdmin = (address: string) => {
    const data = contract.methods.revokeRole(adminRole, address).encodeABI();
    const transactionParameters: TransactionConfig = {
      to: contractAddress,
      from: account,
      value: "0x00",
      data,
    };
    return sendTransaction(transactionParameters);
  };

  const getAdminAt = (index: number) => {
    return contract.methods.getRoleMember(adminRole, index).call();
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isFetching,
        adminCount,
        roleMembers,
        balance,
        getFeeRate,
        getAirdropRate,
        updateFeeRate,
        updateAirdropRate,
        addAdmin,
        removeAdmin,
        getAdminAt,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContractProvider;
