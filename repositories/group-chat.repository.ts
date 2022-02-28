import db from "@db";

const groupChatRepository = {
  getGroupChatById: async (chatId: bigint) => {
    return await db.groupChat.findUnique({
      where: {
        chatId: chatId,
      },
      include: {
        GroupChatMember: true,
      },
    });
  },
  createGroupChat: async (chatId: bigint, title: string) => {
    return await db.groupChat.create({ data: { chatId, title } });
  },
  updateGroupChat: async (originalChatId: bigint, migrateChatId: bigint) => {
    return await db.groupChat.update({
      data: {
        chatId: migrateChatId,
      },
      where: {
        chatId: originalChatId,
      },
    });
  },
  updateGroupChatAndLinkedRecords: async (
    originalChatId: bigint,
    migrateChatId: bigint
  ) => {
    const updateGroupMember = db.groupChatMember.updateMany({
      where: {
        groupChatId: originalChatId,
      },
      data: {
        groupChatId: migrateChatId,
      },
    });
    const updateGroupChat = db.groupChat.update({
      data: {
        chatId: migrateChatId,
      },
      where: {
        chatId: originalChatId,
      },
    });

    const updateMemberAirdrop = db.activeAirdropMember.updateMany({
      where: {
        groupChatId: originalChatId,
      },
      data: {
        groupChatId: migrateChatId,
      },
    });

    const updateActiveAirdrop = db.activeAirdrop.updateMany({
      where: {
        chatId: originalChatId,
      },
      data: {
        chatId: migrateChatId,
      },
    });

    return await db.$transaction([
      updateGroupMember,
      updateGroupChat,
      updateMemberAirdrop,
      updateActiveAirdrop,
    ]);
  },
  migrateGroupChatIdAndLinkedRecords: async (
    originalChatId: bigint,
    migrateChatId: bigint
  ) => {
    const updateGroupMember = db.groupChatMember.updateMany({
      where: {
        groupChatId: originalChatId,
      },
      data: {
        groupChatId: migrateChatId,
      },
    });
    const updateGroupChat = db.groupChat.update({
      data: {
        chatId: migrateChatId,
      },
      where: {
        chatId: originalChatId,
      },
    });

    const updateMemberAirdrop = db.activeAirdropMember.deleteMany({
      where: {
        groupChatId: originalChatId,
      },
    });

    const updateActiveAirdrop = db.activeAirdrop.deleteMany({
      where: {
        chatId: originalChatId,
      },
    });

    return await db.$transaction([
      updateGroupMember,
      updateGroupChat,
      updateMemberAirdrop,
      updateActiveAirdrop,
    ]);
  },
  deleteGroupChatByIdAndLinkedRecords: async (chatId: bigint) => {
    const deleteGroupMember = db.groupChatMember.deleteMany({
      where: {
        groupChatId: chatId,
      },
    });

    const deleteGroupChat = db.groupChat.delete({
      where: {
        chatId: chatId,
      },
    });

    const deleteAirdropMember = db.activeAirdropMember.deleteMany({
      where: {
        groupChatId: chatId,
      },
    });

    const deleteAirdropActive = db.activeAirdrop.deleteMany({
      where: {
        chatId: chatId,
      },
    });

    return await db.$transaction([
      deleteGroupMember,
      deleteGroupChat,
      deleteAirdropMember,
      deleteAirdropActive,
    ]);
  },
  deleteGroupChatById: async (chatId: bigint) => {
    return await db.groupChat.delete({
      where: {
        chatId: chatId,
      },
    });
  },
  getMembersByChatId: async (chatId: bigint) => {
    return (
      await db.groupChat.findUnique({
        where: {
          chatId: chatId,
        },
        include: {
          GroupChatMember: true,
        },
      })
    )?.GroupChatMember;
  },
};

export default groupChatRepository;
