import { Update } from "node-telegram-bot-api";

import db from "@db";

export class ChatService {
  async registerChatId(update: Update) {
    const {
      chat: { id },
      from,
    } = update.message!;

    const userId = from!.id;

    if (!userId) {
      throw new Error("No user Id found.");
    }
    return db.chat.upsert({
      create: {
        chatId: id,
        userId,
      },
      update: {
        chatId: id,
      },
      where: {
        userId,
      },
    });
  }
}
