import { CallbackQuery, Message, Update } from "node-telegram-bot-api";

import { groupMemberService } from "services";
import activeAirdropRepository from "repositories/active-airdrop.repository";
import airdropMemberRepository from "repositories/airdrop-member.repository";

export class ActiveAirdropService {
  async createActiveAirdrop(amount: number, count: number, message: Message) {
    let activeAirdrop;
    const {
      chat: { id },
      message_id,
    } = message!;

    if (!id) {
      console.error("No chat Id found");
      return;
    }

    if (!message_id) {
      console.error("No message Id found");
      return;
    }
    try {
      activeAirdrop = await activeAirdropRepository.createActiveAirdrop(
        amount,
        count,
        BigInt(id),
        BigInt(message_id)
      );
    } catch (e) {
      console.error(e);
    }

    return activeAirdrop;
  }

  async registerToActiveAirdrop(callbackQuery: CallbackQuery) {
    const { message, from } = callbackQuery!;

    const groupChatId = message?.chat.id;
    const messageId = message?.message_id;
    const userId = from?.id;

    if (!groupChatId) {
      console.error("Group chat Id not found");
      return;
    }

    if (!messageId) {
      console.error("Message Id not found");
      return;
    }

    if (!userId) {
      console.error("User Id not found");
      return;
    }

    let registeredAirdropMember;

    const member = await groupMemberService.checkMemberRegisteredByCallback(
      callbackQuery
    );

    if (!member) {
      await groupMemberService.registerMemberByCallback(callbackQuery);
    }

    const activeAirdropExist = await this.getActiveAirdrop(messageId);

    if (!activeAirdropExist) {
      console.error(
        `Active airdrop with message_id ${messageId} does not exist`
      );
      return registeredAirdropMember;
    }

    try {
      registeredAirdropMember =
        await airdropMemberRepository.createActiveAirdropMember(
          BigInt(messageId),
          BigInt(groupChatId),
          BigInt(userId)
        );
    } catch (e) {
      console.error(e);
    }

    return registeredAirdropMember;
  }

  async getActiveAirdrop(messageId: number) {
    let activeAirdrop;

    try {
      activeAirdrop = await activeAirdropRepository.getActiveAirdropById(
        BigInt(messageId)
      );
    } catch (e) {
      console.error(e);
    }

    return activeAirdrop;
  }

  async getActiveAirdropsByChatId(chatId: number) {
    let activeAirdrop;

    try {
      activeAirdrop = await activeAirdropRepository.getActiveAirdropsByChatId(
        BigInt(chatId)
      );
    } catch (e) {
      console.error(e);
    }

    return activeAirdrop;
  }

  async getRegisteredMembersByMessageId(messageId: number) {
    let members;
    try {
      members = (
        await activeAirdropRepository.getActiveAirdropById(BigInt(messageId))
      )?.ActiveAirdropMember;
    } catch (e) {
      console.error(e);
    }
    return members;
  }

  async removeActiveAirdrop(messageId: number) {
    let isDeleted;

    try {
      await activeAirdropRepository.deleteActiveAirdropByIdAndLinkedRecords(
        BigInt(messageId)
      );
      isDeleted = true;
    } catch (e) {
      console.error(e);
    }

    return isDeleted;
  }
}
