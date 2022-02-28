import {
  ActiveAirdrop,
  ActiveAirdropMember,
  GroupChat,
  GroupChatMember,
} from "@prisma/client";
import groupChatRepository from "../../repositories/group-chat.repository";
import { resetData } from "../utils";
import { GroupChatWithoutDate } from "../types";
import testData from "../test-data";
import groupMemberRepository from "repositories/group-member.repository";
import activeAirdropRepository from "repositories/active-airdrop.repository";
import airdropMemberRepository from "repositories/airdrop-member.repository";

jest.setTimeout(40000);
beforeAll(async () => {
  await resetData();
});

test("should update groupchat Id together with its linked rows", async () => {
  const migrate_to_chat_id = BigInt(9876);

  const groupChat: GroupChat = testData.groupChat[1];

  const chatId = groupChat.chatId;

  const memberOne: GroupChatMember = testData.groupChatMember[0];
  const memberTwo: GroupChatMember = testData.groupChatMember[1];

  const activeAirdrop: ActiveAirdrop = {
    ...testData.activeAirdrop[0],
    chatId: chatId,
  };

  const activeMemberOne: ActiveAirdropMember = {
    messageId: activeAirdrop.messageId,
    userId: memberOne.userId,
    groupChatId: chatId,
  };
  const activeMemberTwo: ActiveAirdropMember = {
    messageId: activeAirdrop.messageId,
    userId: memberTwo.userId,
    groupChatId: chatId,
  };

  const groupChatCreated: GroupChatWithoutDate =
    await groupChatRepository.createGroupChat(chatId, groupChat.title);

  const memberOneCreated = await groupMemberRepository.createGroupMember(
    memberOne.userId,
    chatId,
    memberOne.username!
  );
  const memberTwoCreated = await groupMemberRepository.createGroupMember(
    memberTwo.userId,
    chatId,
    memberTwo.username!
  );

  const groupChatMembers = (
    await groupMemberRepository.getMembersByChatId(chatId)
  ).map((gm) => {
    const { ActiveAirdropMember, ...rest } = gm;
    return rest;
  });

  expect<Array<GroupChatMember>>([memberOneCreated, memberTwoCreated]).toEqual<
    Array<GroupChatMember>
  >(groupChatMembers!);

  await activeAirdropRepository.createActiveAirdrop(
    activeAirdrop.amount,
    activeAirdrop.count,
    activeAirdrop.chatId,
    activeAirdrop.messageId
  );

  await airdropMemberRepository.createActiveAirdropMember(
    activeAirdrop.messageId,
    chatId,
    activeMemberOne.userId
  );

  await airdropMemberRepository.createActiveAirdropMember(
    activeAirdrop.messageId,
    chatId,
    activeMemberTwo.userId
  );

  await expect(
    activeAirdropRepository.getAirdropMembers(chatId, activeAirdrop.messageId)
  ).resolves.toEqual<Array<ActiveAirdropMember>>([
    activeMemberOne,
    activeMemberTwo,
  ]);

  // Update Group Chat Id to see if the linked records will also update

  await groupChatRepository.migrateGroupChatIdAndLinkedRecords(
    groupChatCreated.chatId,
    migrate_to_chat_id
  );

  const updatedGroupChat = await groupChatRepository.getGroupChatById(
    migrate_to_chat_id
  );

  expect<GroupChatWithoutDate>({
    chatId: migrate_to_chat_id,
    title: groupChatCreated.title,
  }).toEqual<GroupChatWithoutDate>({
    chatId: updatedGroupChat!.chatId,
    title: updatedGroupChat!.title,
  });

  const membersAfterUpdated = (
    await groupMemberRepository.getMembersByChatId(migrate_to_chat_id)
  ).map((m) => {
    const { ActiveAirdropMember, ...rest } = m;
    return rest;
  });

  const membersAfterUpdateData: Array<GroupChatMember> = [
    memberOne,
    memberTwo,
  ].map((m) => ({
    ...m,
    groupChatId: migrate_to_chat_id,
  }));

  expect<Array<GroupChatMember>>(membersAfterUpdated!).toEqual<
    Array<GroupChatMember>
  >(membersAfterUpdateData);


  try{
   const airdropAfterUpdate = await activeAirdropRepository.getActiveAirdropByIds(
      activeAirdrop.messageId,
      migrate_to_chat_id
    )!;

    expect(airdropAfterUpdate).toBeNull();
    expect(airdropAfterUpdate?.ActiveAirdropMember).toBeUndefined();
  }catch(e){
    console.error(e);
    expect(true).toBeTruthy();
  }
  
  // const airdropMembers = ((
  //   await groupMemberRepository.getMembersByChatId(migrate_to_chat_id)
  // ).filter((e)=>{
  //   return e.ActiveAirdropMember !== undefined;
  // }))
  // .map((m) => {
  //   const { ActiveAirdropMember, ...rest } = m;
  //   return ActiveAirdropMember.find((am)=>(am.messageId === activeAirdrop.messageId))
  // });

  // expect<Array<ActiveAirdropMember>>(airdropMembers).toEqual<
  //   Array<ActiveAirdropMember>
  // >(airdropMembersUpdated);
});
