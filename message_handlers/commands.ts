import TelegramBot, { Update } from "node-telegram-bot-api";
import { botCommands } from "../shared/utils";
import { MessageHandler } from "./types";

export class CommandsMessageHandler implements MessageHandler {
  identifier = /\/commands/g;
  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      chat: { id },
    } = update.message!;

    const commands = botCommands.privateChatCommands.map((cm) => {
      const parseDescription = cm.description.split(":");
      let m = `${cm.command} - ${cm.description}`;
      if (parseDescription.length === 2) {
        const [commandSyntax, ...rest] = parseDescription;
        m = `${cm.command} ${commandSyntax} - ${rest}`;
      }
      return m;
    });

    const stringifyCommands = commands.join("\n");

    await bot.sendMessage(id, `Bot Commands:\n${stringifyCommands}`);
  }
}
