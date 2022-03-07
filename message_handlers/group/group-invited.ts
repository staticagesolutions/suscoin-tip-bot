import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";

import db from "@db";
import { botCommands, stringifyBotCommands } from "../../shared/utils";

export const invitedToGroup = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id, title },
  } = update.message!;

  if (!title) {
    console.error("Invited to Group Error: Missing title");
    return;
  }
  const commands = botCommands.standardCommands;
  const messageOptions: SendMessageOptions = {
    parse_mode: "Markdown",
  };
  await bot.sendMessage(
    id,
    `*Welcome to the Sys NEVM Tip bot*\n\nGet Started:\n${stringifyBotCommands(commands)}`,
    messageOptions
  );
  await bot.sendMessage(
    id,
    `Also, Please change _Chat history for new members_ setting to *visible* in order for tipping feature to work properly.`,
    messageOptions
  );
  const exists = await db.groupChat.findFirst({ where: { chatId: id } });
  if (exists) {
    return true;
  }
  await db.groupChat.create({ data: { chatId: id, title } });
  await bot.setMyCommands(commands);
  console.log(`Invited to Group: [${id}] \"${title}\"`);
};
