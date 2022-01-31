import TelegramBot, { Update } from "node-telegram-bot-api";
import { ChatService } from "services/chat-service";
import { MessageHandler } from "./types";

export class StartMessageHandler implements MessageHandler {
  identifier = /\/start*/g;
  constructor(private chatService: ChatService) {}
  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      chat: { id },
      text,
    } = update.message!;
    const message = `✅ Thanks for your message: *"${text}"*\nHave a great day! 👋🏻`;
    await this.chatService.registerChatId(update);
    await bot.sendMessage(id, message, { parse_mode: "Markdown" });
  }
}
