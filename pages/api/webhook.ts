// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import TelegramBot, { Update } from "node-telegram-bot-api";
import { messageHandlers } from "../../message_handlers";
import db from '@db';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN!);

  const update: Update = req.body;

  try {
    if (update.message) {
      const { text } = update.message;
      const command = text!;
      const messageHandler = messageHandlers.find((handler) =>
        handler.identifier.test(command)
      );
      if (messageHandler) {
        await messageHandler.handleMessage(bot, update);
      }
      db.$disconnect();
    }
  } catch (error) {
    console.error("Error sending message");
    console.log(error);
  }

  res.send("OK");
}
