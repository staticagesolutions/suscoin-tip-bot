import { NextApiHandler } from "next";

import db from "@db";
import { WithdrawalRequestStatus } from "types/withdrawal-request-status";

const handler: NextApiHandler = (req, res) => {
  if (req.method === "GET") {
    const request = db.withdrawalRequest.findFirst({
      where: { status: WithdrawalRequestStatus.ACTIVE },
    });
    if (!request) {
      return res.status(404).json({ message: "No active requests" });
    }
  }

  return res.status(400).json({ message: "Invalid API" });
};

export default handler;
