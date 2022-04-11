import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import db from "@db";
import { AdminStatus } from "types/admin-status";
import { getContract } from "shared/api-helpers";

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
