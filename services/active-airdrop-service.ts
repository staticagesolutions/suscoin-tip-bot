import { CallbackQuery, Message, Update } from "node-telegram-bot-api";

import db from "@db";
import { groupMemberService } from "services";

export class ActiveAirdropService {
  async createActiveAirdrop(amount: number, message: Message) {
    const {
      chat: { id },
      message_id,
    } = message!;

    return db.activeAirdrop.create({
      data: {
        messageId: message_id,
        chatId: id,
        amount: amount,
      },
    });
  }
  async registerToActiveAirdrop(callbackQuery: CallbackQuery) {
    const { message, from } = callbackQuery!;

    const groupChatId = message?.chat.id!;
    const messageId = message?.message_id!;
    const userId = from?.id!;
    const member = await groupMemberService.checkMemberRegisteredByCallback(
      callbackQuery
    );

    if (!member) {
      await groupMemberService.registerMemberByCallback(callbackQuery);
    }

    const activeAirdropExist = await this.getActiveAirdrop(messageId);
    if (!activeAirdropExist) {
      throw new Error(
        `Active airdrop with message_id ${messageId} does not exist`
      );
    }

    return db.activeAirdropMember.create({
      data: {
        groupChatId,
        messageId,
        userId,
      },
    });
  }

  async isRegisteredToAirdrop(callbackQuery: CallbackQuery) {
    const { message, from } = callbackQuery!;

    const userId = from.id!;
    const messageId = message!.message_id;
    return db.activeAirdropMember.findFirst({
      where: { messageId, userId },
    });
  }

  async getActiveAirdrop(messageId: number) {
    return db.activeAirdrop.findUnique({
      where: {
        messageId,
      },
      include: {
        ActiveAirdropMember: true,
      },
    });
  }

  async getRegisteredMembers(messageId: number) {
    return db.activeAirdropMember.findMany({
      where: {
        messageId: messageId,
      },
    });
  }

  async removeActiveAirdrop(messageId: number) {
    await db.activeAirdrop.delete({
      where: {
        messageId,
      },
    });

    return db.activeAirdropMember.deleteMany({
      where: {
        messageId,
      },
    });
  }
}
