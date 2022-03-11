import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import db from "@db";
import web3 from "services/web3";
import ContractJSON from "@contracts/TipBot.json";
import { AbiItem } from "web3-utils";
import { AdminStatus } from "types/admin-status";

const getContract = (address: string) => {
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

export interface SetNamePayload {
  name: string;
}

const getAdmin: NextApiHandler = async (request, response) => {
  const address = request.query.address as string;

  if (!address) {
    return response.status(400).json({ message: "No address" });
  }

  const admin = await db.admin.findFirst({ where: { address } });

  response.status(200).json(admin);
};

const updateAdmin: NextApiHandler = async (request, response) => {
  const address = request.query.address as string;
  const { name }: SetNamePayload = request.body;

  const contract = getContract(process.env.CONTRACT_ADDRESS!);

  const isAdmin = await contract.isAdmin(address);

  if (!isAdmin) {
    return response.status(400).json({ message: "Not an admin" });
  }

  const admin = await db.admin.upsert({
    create: {
      address,
      name,
      status: AdminStatus.ACTIVE,
    },
    update: {
      name,
    },
    where: {
      address,
    },
  });

  response.status(200).json(admin);
};

const handler: NextApiHandler = (
  request: NextApiRequest,
  response: NextApiResponse
) => {
  if (request.method === "PUT") {
    return updateAdmin(request, response);
  } else if (request.method === "GET") {
    return getAdmin(request, response);
  }
  return response.status(400).json({ message: "Invalid method" });
};

export default handler;
