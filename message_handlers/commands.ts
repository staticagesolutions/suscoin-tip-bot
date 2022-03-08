import TelegramBot, { Update } from "node-telegram-bot-api";
import { botCommands, stringifyBotCommands } from "../shared/utils";
import { MessageHandler } from "./types";

export class CommandsMessageHandler implements MessageHandler {
  identifier = /\/commands/g;
  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      chat: { id },
    } = update.message!;

    const stringifyCommands = stringifyBotCommands(
      botCommands.privateChatCommands
    );

    await bot.sendMessage(id, `Bot Commands:\n${stringifyCommands}`);
  }
}
