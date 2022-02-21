import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { MessageHandler } from "./types";
import fs from "fs";
import path from "path";

export class HelpMessageHandler implements MessageHandler {
  identifier = /\/help|❓ Help*/g;
  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      chat: { id },
    } = update.message!;
    const sendMessageConfig: SendMessageOptions = {
      parse_mode: "Markdown",
    };

    const message = this.generateHelpMessage();

    await bot.sendMessage(id, message, sendMessageConfig);
  }

  generateHelpMessage() {
    const message = fs.readFileSync(
      path.resolve("message_handlers/templates/help.md"),
      "utf-8"
    );
    return message;
  }
}
