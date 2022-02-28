import { CallbackQuery, Update } from "node-telegram-bot-api";

import db from "@db";
import groupMemberRepository from "repositories/group-member.repository";

export class GroupMemberService {
  async registerMember(update: Update) {
    const {
      chat: { id },
      from,
    } = update.message!;
    let member;
    const username = from?.username;

    if (!from?.id) {
      console.error("No User Id found");
      return;
    }

    if (!id) {
      console.error("No Chat Id found");
      return;
    }

    const userId = BigInt(from.id);
    const chatId = BigInt(id);

    try {
      member = await groupMemberRepository.createGroupMember(
        userId,
        chatId,
        username
      );
    } catch (e) {
      console.error(e);
    }
    return member;
  }

  async registerMemberByCallback(callbackQuery: CallbackQuery) {
    const { message, from } = callbackQuery!;
    const groupChatId = message?.chat.id!;

    if (from.is_bot) {
      console.error("Registering a bot is invalid");
      return;
    }
    let member;
    const username = from?.username;

    if (!from?.id) {
      console.error("No User Id found");
      return;
    }

    if (!groupChatId) {
      console.error("No Chat Id found");
      return;
    }

    const userId = BigInt(from.id);
    const chatId = BigInt(groupChatId);

    try {
      member = await groupMemberRepository.createGroupMember(
        userId,
        chatId,
        username
      );
    } catch (e) {
      console.error(e);
    }
    return member;
  }

  async checkMemberRegistered(update: Update) {
    const {
      chat: { id },
      from,
    } = update.message!;

    let member;

    if (!from?.id) {
      console.error("No user Id found");
      return;
    }

    if (!id) {
      console.error("No user Id found");
      return;
    }

    const userId = BigInt(from.id);
    const chatId = BigInt(id);

    try {
      member = await groupMemberRepository.getMemberByIds(userId, chatId);
    } catch (e) {
      console.error(e);
    }

    return member;
  }

  async checkMemberRegisteredByCallback(callbackQuery: CallbackQuery) {
    const { from, message } = callbackQuery!;

    let member;

    if (!from?.id) {
      console.error("No user Id found");
      return;
    }

    if (!message?.chat?.id) {
      console.error("No chat Id found");
      return;
    }

    const userId = BigInt(from.id);
    const chatId = BigInt(message.chat.id);

    try {
      member = await groupMemberRepository.getMemberByIds(userId, chatId);
    } catch (e) {
      console.error(e);
    }

    return member;
  }

  async getGroupChatMembers(chatId: number) {
    let result;
    try {
      result = await groupMemberRepository.getMembersByChatId(BigInt(chatId));
    } catch (e) {
      console.error(e);
    }

    return result;
  }
}
