import { GroupChat } from "@prisma/client";
import groupChatRepository from "../../repositories/group-chat.repository";
import { resetData } from "../utils";
import { GroupChatWithoutDate } from "../types";
import testData from "../test-data";

jest.setTimeout(20000);
beforeAll(async () => {
  await resetData();
});

describe("Validate Logic of GroupChatRepository", () => {
  test("should create new group chat ", async () => {
    const groupChat: GroupChat = testData.groupChat[0];

    // prismaMock.groupChat.create.mockResolvedValue(groupChat);
    const { chatId, title } = await groupChatRepository.createGroupChat(
      groupChat.chatId,
      groupChat.title
    );

    expect<GroupChatWithoutDate>({
      chatId,
      title,
    }).toEqual<GroupChatWithoutDate>({
      chatId: groupChat.chatId,
      title: groupChat.title,
    });
  });

  test("should update group chat chatId", async () => {
    const data = {
      migrate_to_chat_id: BigInt(200),
    };

    const groupChat: GroupChat = testData.groupChat[1];

    const groupChatCreated: GroupChatWithoutDate =
      await groupChatRepository.createGroupChat(
        groupChat.chatId,
        groupChat.title
      );

    const groupChatUpdated: GroupChatWithoutDate =
      await groupChatRepository.updateGroupChat(
        groupChatCreated.chatId,
        data.migrate_to_chat_id
      );

    expect<GroupChatWithoutDate>({
      chatId: data.migrate_to_chat_id,
      title: groupChatCreated.title,
    }).toEqual<GroupChatWithoutDate>({
      chatId: groupChatUpdated.chatId,
      title: groupChatUpdated.title,
    });
  });
});
