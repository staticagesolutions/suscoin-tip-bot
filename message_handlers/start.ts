import TelegramBot, { BotCommand, Update } from "node-telegram-bot-api";
import { ChatService } from "services/chat-service";
import { MessageHandler } from "./types";
import fs from "fs";
import path from "path";
import { botCommands } from "../shared/utils";

export class StartMessageHandler implements MessageHandler {
  identifier = /\/start*/g;
  constructor(private chatService: ChatService) {}
  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      chat: { id },
    } = update.message!;
    const message = this.generateStartMessage();

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
    await bot.setMyCommands(botCommands.standardCommands, {
      scope: {
        type: "all_group_chats",
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
