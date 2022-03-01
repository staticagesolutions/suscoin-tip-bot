import db from "@db";

const activeAirdropRepository = {
  createActiveAirdrop: async (
    amount: number,
    count: number,
    chatId: bigint,
    messageId: bigint
  ) => {
    return await db.activeAirdrop.create({
      data: {
        amount,
        count,
        chatId,
        messageId,
      },
    });
  },
  getActiveAirdropById: async (messageId: bigint) => {
    return await db.activeAirdrop.findUnique({
      where: {
        messageId: messageId,
      },
      include: {
        ActiveAirdropMember: true,
      },
    });
  },
  getActiveAirdropsByChatId: async (chatId: bigint) => {
    return await db.activeAirdrop.findMany({
      where: {
        chatId: chatId,
      },
      include: {
        ActiveAirdropMember: true,
      },
    });
  },
  getActiveAirdropByIds: async (messageId: bigint, chatId: bigint) => {
    return await db.activeAirdrop.findFirst({
      where: {
        messageId,
        chatId,
      },
      include: {
        ActiveAirdropMember: true,
      },
    });
  },
  getAirdropMembers: async (chatId: bigint, messageId: bigint) => {
    return (
      await activeAirdropRepository.getActiveAirdropByIds(messageId, chatId)
    )?.ActiveAirdropMember;
  },
  deleteActiveAirdropById: async (messageId: bigint) => {
    return db.activeAirdrop.delete({
      where: {
        messageId: messageId,
      },
    });
  },
  deleteActiveAirdropByIdAndLinkedRecords: async (messageId: bigint) => {
    const deleteMembers = db.activeAirdropMember.deleteMany({
      where: {
        messageId: messageId,
      },
    });
    const deleteAirdrop = db.activeAirdrop.delete({
      where: {
        messageId: messageId,
      },
      include: {
        ActiveAirdropMember: true,
      },
    });
    return await db.$transaction([deleteMembers, deleteAirdrop]);
  },
};

export default activeAirdropRepository;
