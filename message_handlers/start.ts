import TelegramBot, { BotCommand, Update } from "node-telegram-bot-api";
import { ChatService } from "services/chat-service";
import { MessageHandler } from "./types";
import fs from "fs";
import path from "path";

export class StartMessageHandler implements MessageHandler {
  identifier = /\/start*/g;
  constructor(private chatService: ChatService) {}
  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      chat: { id },
      text,
    } = update.message!;
    const message = this.generateStartMessage();

    const privateChatCommands: BotCommand[] = [
      {
        command: "/send",
        description: "<address> <amount>",
      },
    ];

    await bot.setMyCommands(privateChatCommands, {
      scope: {
        type: "all_private_chats",
      },
    });

    await this.chatService.registerChatId(update);
    await bot.sendMessage(id, message, {
      parse_mode: "Markdown",
      reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: [
          [
            {
              text: "✅ I understand",
            },
          ],
        ],
      },
    });
  }

  generateStartMessage() {
    const message = fs.readFileSync(
      path.resolve("message_handlers/templates/start.md"),
      "utf-8"
    );
    return message;
  }
}
