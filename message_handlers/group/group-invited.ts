import TelegramBot, { Update } from "node-telegram-bot-api";

import db from "@db";
import { botCommands } from "../../shared/utils";

export const invitedToGroup = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id, title },
  } = update.message!;

  if (!title) {
    console.error("Invited to Group Error: Missing title");
    return;
  }
  const exists = await db.groupChat.findFirst({ where: { chatId: id } });
  if (exists) {
    return true;
  }
  await db.groupChat.create({ data: { chatId: id, title } });
  await bot.setMyCommands(botCommands.standardCommands);
  console.log(`Invited to Group: [${id}] \"${title}\"`);
};
