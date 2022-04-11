import { NextApiHandler } from "next";
import { getContract } from "shared/api-helpers";
import db, { WithdrawalRequest } from "@db";
import { WithdrawalRequestStatus } from "types/withdrawal-request-status";
import web3 from "services/web3";

const createWithdrawalRequest = async (
  amount: string,
  reason: string,
  address: string
) => {
  if (isNaN(parseFloat(amount)) || !reason || !address) {
    throw new Error("Invalid parameters");
  }
  const contract = getContract(process.env.CONTRACT_ADDRESS!);
  const isAdmin = await contract.isAdmin(address);
  if (!isAdmin) {
    throw new Error("Not admin");
  }

  const activeWithdrawalRequest = await db.withdrawalRequest.findFirst({
    where: { status: WithdrawalRequestStatus.ACTIVE },
  });

  if (activeWithdrawalRequest) {
    throw new Error("Has ongoing withdrawal request");
  }

  const withdrawalRequest = await db.withdrawalRequest.create({
    data: {
      amount: web3.utils.toWei(`${amount}`),
      reason,
      initiatedBy: address,
    },
  });

  return withdrawalRequest;
};

const getAllWithdawalRequests = async () => {
  return db.withdrawalRequest.findMany({
    include: {
      signatures: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const handler: NextApiHandler = async (req, res) => {
  try {
    if (req.method === "POST") {
      const { amount, reason, address } = JSON.parse(req.body);
      const withdrawalRequest = await createWithdrawalRequest(
        amount,
        reason,
        address
      );
      return res.status(200).json(withdrawalRequest);
    } else if (req.method === "GET") {
      const requests = await getAllWithdawalRequests();
      return res.status(200).json(requests);
    }
  } catch (e: any) {
    console.error(e);
    return res.status(400).json({ message: e.message });
  }
  return res.status(400).json({ message: "Not supported" });
};

export default handler;
