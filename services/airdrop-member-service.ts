import { CallbackQuery } from "node-telegram-bot-api";
import activeAirdropRepository from "repositories/active-airdrop.repository";
import airdropMemberRepository from "repositories/airdrop-member.repository";

export class AirdropMemberService {
  async getActiveMembers(groupChatId: number, messageId: number) {
    let members;

    try {
      members = await activeAirdropRepository.getAirdropMembers(
        BigInt(groupChatId),
        BigInt(messageId)
      );
    } catch (e) {
      console.error(e);
    }

    return members;
  }

  async isRegisteredToAirdrop(callbackQuery: CallbackQuery) {
    const { message, from } = callbackQuery!;
    let foundMember;

    if (!from?.id) {
      console.error("No user Id found");
      return;
    }

    if (!message?.message_id) {
      console.error("No chat Id found");
      return;
    }

    const userId = BigInt(from.id);
    const messageId = BigInt(message.message_id);

    try {
      foundMember = await airdropMemberRepository.getAirdropMember(
        messageId,
        userId
      );
    } catch (e) {
      console.error(e);
    }

    return foundMember;
  }
}
