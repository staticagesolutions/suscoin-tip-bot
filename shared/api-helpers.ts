import web3 from "services/web3";

import ContractJSON from "@contracts/TipBot.json";
import { AbiItem } from "web3-utils";

export const getContract = (address: string) => {
  const contract = new web3.eth.Contract(
    ContractJSON.abi as AbiItem[],
    address
  );

  const adminRole = contract.methods.DEFAULT_ADMIN_ROLE();

  const isAdmin = async (address: string): Promise<boolean> => {
    const role = await adminRole.call();
    return contract.methods.hasRole(role, address);
  };

  return {
    adminRole,
    isAdmin,
  };
};
