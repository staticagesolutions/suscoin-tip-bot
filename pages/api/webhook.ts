// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import TelegramBot, { Update } from "node-telegram-bot-api";
import { messageHandlers } from "../../message_handlers";
import db from "@db";
import { callbackHandlers, callbackUtils } from "../../callback_handlers";

import { handleGroupMessage } from "message_handlers/group";
import { CallbackData } from "callback_handlers/enums";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN!);

  const update: Update = req.body;

  try {
    if (update.message) {
      const {
        text,
        chat: { type },
      } = update.message;
      if (type === "group" || type === "supergroup") {
        handleGroupMessage(bot, update);
      } else {
        const command = text!;
        const messageHandler = messageHandlers.find((handler) =>
          handler.identifier.test(command)
        );
        if (messageHandler) {
          await messageHandler.handleMessage(bot, update);
        }
      }
    } else if (update.callback_query) {
      const { data } = update.callback_query;
      if (data === CallbackData.None) {
        await callbackUtils.removeInlineKeyboardOptions(bot, update);
      } else {
        const callbackHandler = callbackHandlers.find((handler) =>
          new RegExp(handler.callbackData).test(data!)
        );
        if (callbackHandler) {
          await callbackHandler.handleCallback(bot, update);
        }
      }
    }
    db.$disconnect();
  } catch (error) {
    console.error("Error sending message");
    console.log(error);
  }

  res.send("OK");
}
