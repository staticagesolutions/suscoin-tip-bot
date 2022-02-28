import { CallbackQuery, Update } from "node-telegram-bot-api";

import groupChatRepository from "../repositories/group-chat.repository";

export class GroupChatService {
  async createGroupChat(update: Update) {
    const { title, id } = update.message!.chat!;
    let groupChat;
    if (!title) {
      console.error("The group chat has no title.");
      return groupChat;
    }

    try {
      groupChat = await groupChatRepository.createGroupChat(BigInt(id), title);
    } catch (e) {
      console.error(e);
    }
    return groupChat;
  }

  async migrateGroupChatId(originalChatId: number, migrateChatId: number) {
    let migrated = false;
    try{
      const updated = await groupChatRepository.migrateGroupChatIdAndLinkedRecords(BigInt(originalChatId), BigInt(migrateChatId));
      if(updated){
        migrated = true;
      }
    }catch(e){
      console.error(e);
    }
    return migrated
  }
}
