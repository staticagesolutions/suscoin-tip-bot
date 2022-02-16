import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { MessageHandler } from "./types";

export class HelpMessageHandler implements MessageHandler {
  identifier = /\/help|❓ Help*/g;
  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      chat: { id },
    } = update.message!;
    const sendMessageConfig: SendMessageOptions = {
      parse_mode: "Markdown",
    };

    const message = "help verbiage... TODO"; //TODO: Update /help command content

    await bot.sendMessage(id, message, sendMessageConfig);
  }
}
