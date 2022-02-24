import { CallbackQuery, Update } from "node-telegram-bot-api";

import db from "@db";

export class GroupMemberService {
  async registerMember(update: Update) {
    const {
      chat: { id },
      from,
    } = update.message!;

    const username = from!.username;
    const userId = from!.id;
    return db.groupChatMember.upsert({
      create: {
        groupChatId: id,
        username: username,
        userId: userId,
      },
      update: {
        groupChatId: id,
        username: username,
      },
      where: {
        userId_groupChatId: {
          userId: userId,
          groupChatId: id,
        },
      },
    });
  }

  async registerMemberByCallback(callbackQuery: CallbackQuery) {
    const { message, from } = callbackQuery!;
    const username = from!.username!;
    const userId = from!.id!;
    const groupChatId = message?.chat.id!;

    if (from.is_bot) {
      return;
    }
    return db.groupChatMember.upsert({
      create: {
        groupChatId: groupChatId,
        username: username,
        userId: userId,
      },
      update: {
        groupChatId: groupChatId,
        username: username,
      },
      where: {
        userId_groupChatId: {
          userId: userId,
          groupChatId: groupChatId,
        },
      },
    });
  }

  async checkMemberRegistered(update: Update) {
    const {
      chat: { id },
      from,
    } = update.message!;

    const memberId = from!.id;

    return db.groupChatMember.findFirst({
      where: { userId: memberId, groupChatId: id },
    });
  }

  async checkMemberRegisteredByCallback(callbackQuery: CallbackQuery) {
    const { from, message } = callbackQuery!;

    const userId = from!.id;
    const groupChatId = message!.chat.id;

    return db.groupChatMember.findFirst({
      where: { userId, groupChatId },
    });
  }

  async getGroupChatAndMembers(chatId: number) {
    const result = await db.groupChat.findUnique({
      where: {
        chatId: chatId,
      },
      include: {
        GroupChatMember: true,
      },
    });

    return result;
  }

  async getGroupChatMembers(chatId: number) {
    return (await this.getGroupChatAndMembers(chatId))?.GroupChatMember;
  }

  async getActiveMembers(groupChatId: number, messageId: number) {
    return db.activeAirdropMember.findMany({
      where: {
        groupChatId,
        messageId,
      },
    });
  }
}
