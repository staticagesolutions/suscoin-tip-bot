import db from "@db";

const airdropMemberRepository = {
  createActiveAirdropMember: async (
    messageId: bigint,
    groupChatId: bigint,
    userId: bigint
  ) => {
    return await db.activeAirdropMember.create({
      data: {
        messageId,
        groupChatId,
        userId,
      },
    });
  },
  getAirdropMember: async (messageId: bigint, userId: bigint) => {
    return await db.activeAirdropMember.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
    });
  },
  getAirdropMembersByMessageId: async (messageId: bigint) => {
    return await db.activeAirdropMember.findMany({
      where: {
        messageId,
      },
    });
  },
};
export default airdropMemberRepository;
