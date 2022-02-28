import db, { GroupChatMember } from "@db";
import groupChatRepository from "./group-chat.repository";

const groupMemberRepository = {
  createGroupMember: async (
    userId: bigint,
    groupChatId: bigint,
    username?: string
  ) => {
    const member: GroupChatMember = {
      userId,
      username: username ?? null,
      groupChatId,
    };
    return await db.groupChatMember.create({ data: member });
  },

  getMemberByIds: async (userId: bigint, groupChatId: bigint) => {
    return await db.groupChatMember.findUnique({
      where: {
        userId_groupChatId: {
          userId,
          groupChatId,
        },
      },
    });
  },
  getMembersByChatId: async (chatId: bigint) => {
    return await db.groupChatMember.findMany({
      where: {
        groupChatId: chatId,
      },
      include: {
        ActiveAirdropMember: true,
      },
    });
  },
};
export default groupMemberRepository;
