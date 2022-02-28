import { GroupChat, GroupChatMember } from "@prisma/client";
import groupChatRepository from "../../repositories/group-chat.repository";
import { resetData } from "../utils";
import groupMemberRepository from "../../repositories/group-member.repository";
import testData from "../test-data";

jest.setTimeout(20000);
beforeAll(async () => {
  await resetData();
});

describe("Validate Logic of GroupMemberRepository", () => {
  test("should create a groupChatMember data", async () => {
    const testMemberData = testData.groupChatMember[0];

    const member: GroupChatMember = {
      userId: testMemberData.userId,
      username: testMemberData.username,
      groupChatId: testMemberData.groupChatId,
    };

    const registerMember = await groupMemberRepository.createGroupMember(
      member.userId,
      member.groupChatId,
      member.username!
    );

    expect(registerMember).toEqual(member);
  });

  test("should check if member exist", async () => {
    const testMemberData = testData.groupChatMember[1];
    const member: GroupChatMember = {
      userId: testMemberData.userId,
      username: testMemberData.username,
      groupChatId: testMemberData.groupChatId,
    };

    await groupMemberRepository.createGroupMember(
      member.userId,
      member.groupChatId,
      member.username!
    );
    const found = await groupMemberRepository.getMemberByIds(
      testMemberData.userId,
      testMemberData.groupChatId
    );

    expect(found).toEqual(member);
  });

  test("should create a group chat and register a member", async () => {
    const testMemberData = testData.groupChatMember[2];

    const gc: GroupChat = {
      chatId: testMemberData.groupChatId,
      title: "Test GroupChat Title",
      createAt: new Date(),
      updatedAt: new Date(),
    };

    const { chatId, title } = await groupChatRepository.createGroupChat(
      gc.chatId,
      gc.title
    );

    const member: GroupChatMember = {
      userId: testMemberData.userId,
      username: "raphaelmans",
      groupChatId: testMemberData.groupChatId,
    };

    const registerToGc = groupMemberRepository.createGroupMember(
      member.userId,
      member.groupChatId,
      member.username!
    );

    expect({ chatId, title }).toEqual({
      chatId: gc.chatId,
      title: gc.title,
    });
    await expect(registerToGc).resolves.toEqual(member);
  });

  test("should get all members of the group chat and delete data", async () => {
    const length = testData.groupChatMember.length;
    const groupChatId = BigInt(12345);
    const members = testData.groupChatMember.slice(length - 2, length);
    if (members.length !== 2) {
      throw new Error("Error reading test data.");
    }
    const gc: GroupChat = {
      chatId: groupChatId,
      title: "Title check members",
      createAt: new Date(),
      updatedAt: new Date(),
    };

    await groupChatRepository.createGroupChat(gc.chatId, gc.title);

    const memberOne = {
      userId: members[0].userId,
      groupChatId: gc.chatId,
      username: members[0].username!,
    };

    const memberTwo = {
      userId: members[1].userId,
      groupChatId: gc.chatId,
      username: members[1].username!,
    };

    await groupMemberRepository.createGroupMember(
      memberOne.userId,
      memberOne.groupChatId,
      memberOne.username
    );

    await groupMemberRepository.createGroupMember(
      memberTwo.userId,
      memberTwo.groupChatId,
      memberTwo.username
    );

    const groupChatMembers = (
      await groupMemberRepository.getMembersByChatId(gc.chatId)
    ).map((gm) => {
      const { ActiveAirdropMember, ...rest } = gm;
      return rest;
    });

    expect(groupChatMembers?.length).toBe(2);
    expect(groupChatMembers).toEqual([memberOne, memberTwo]);

    await groupChatRepository.deleteGroupChatByIdAndLinkedRecords(gc.chatId);

    await expect(
      groupChatRepository.getGroupChatById(gc.chatId)
    ).resolves.toBeNull();
    await expect(
      groupMemberRepository.getMembersByChatId(gc.chatId)
    ).resolves.toEqual([]);
  });

  test("should get all members of the group chat", async () => {
    const length = testData.groupChatMember.length;
    const groupChatId = BigInt(123456);
    const members = testData.groupChatMember.slice(length - 2, length);
    if (members.length !== 2) {
      throw new Error("Error reading test data.");
    }
    const gc: GroupChat = {
      chatId: groupChatId,
      title: "Title get all members",
      createAt: new Date(),
      updatedAt: new Date(),
    };

    await groupChatRepository.createGroupChat(gc.chatId, gc.title);

    const memberOne = {
      userId: members[0].userId,
      groupChatId: gc.chatId,
      username: members[0].username!,
    };

    const memberTwo = {
      userId: members[1].userId,
      groupChatId: gc.chatId,
      username: members[1].username!,
    };

    await groupMemberRepository.createGroupMember(
      memberOne.userId,
      memberOne.groupChatId,
      memberOne.username
    );

    await groupMemberRepository.createGroupMember(
      memberTwo.userId,
      memberTwo.groupChatId,
      memberTwo.username
    );

    const groupChatMembers = (await groupMemberRepository.getMembersByChatId(
      gc.chatId
    )).map((gm)=>{
      const { ActiveAirdropMember, ...rest} = gm;
      return rest
    });

    expect(groupChatMembers?.length).toBe(2);
    expect(groupChatMembers).toEqual([memberOne, memberTwo]);
  });
});
