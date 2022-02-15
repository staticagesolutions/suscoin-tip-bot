import TelegramBot, { Update } from "node-telegram-bot-api";

import fs from "fs";
import path from "path";

export const help = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id },
  } = update.message!;

  const helpText = fs.readFileSync(
    path.resolve("message_handlers/group/templates/help.md"),
    "utf-8"
  );

  await bot.sendMessage(id, helpText, { parse_mode: "MarkdownV2" });
};
