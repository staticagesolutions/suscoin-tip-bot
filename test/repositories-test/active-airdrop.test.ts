import {
  ActiveAirdrop,
  ActiveAirdropMember,
  GroupChatMember,
} from "@prisma/client";
import { resetData } from "../utils";
import testData from "../test-data";
import airdropRepository from "../../repositories/active-airdrop.repository";
import airdropMemberRepository from "../../repositories/airdrop-member.repository";
import activeAirdropRepository from "../../repositories/active-airdrop.repository";

jest.setTimeout(20000);
beforeAll(async () => {
  await resetData();
});

describe("Validate Logic of ActiveAirdropRepository", () => {
  test("should create new active airdrop and verify if can be found", async () => {
    const activeAirdrop: ActiveAirdrop = testData.activeAirdrop[0];

    await expect(
      airdropRepository.createActiveAirdrop(
        activeAirdrop.amount,
        activeAirdrop.count,
        activeAirdrop.chatId,
        activeAirdrop.messageId
      )
    ).resolves.toEqual(activeAirdrop);

    await expect(
      airdropRepository.getActiveAirdropById(activeAirdrop.messageId)
    ).resolves.toEqual({
      ...activeAirdrop,
      ActiveAirdropMember: [],
    });
  });

  test("should delete active airdrop by Id ", async () => {
    const activeAirdrop: ActiveAirdrop = testData.activeAirdrop[0];

    await airdropRepository.deleteActiveAirdropById(activeAirdrop.messageId);

    const found = await airdropRepository.getActiveAirdropById(
      activeAirdrop.messageId
    );

    expect(found).toBeNull();
  });

  test("should create active airdrop, let airdrop members join and delete airdrop afterwards", async () => {
    const activeAirdrop: ActiveAirdrop = testData.activeAirdrop[1];
    const chatId = activeAirdrop.chatId;

    const memberOne: GroupChatMember = testData.groupChatMember[0];
    const memberTwo: GroupChatMember = testData.groupChatMember[1];

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

    const activeAirdropCreated = await airdropRepository.createActiveAirdrop(
      activeAirdrop.amount,
      activeAirdrop.count,
      activeAirdrop.chatId,
      activeAirdrop.messageId
    );

    expect(activeAirdropCreated).toEqual(activeAirdrop);

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

    await airdropRepository.deleteActiveAirdropByIdAndLinkedRecords(
      activeAirdrop.messageId
    );

    await expect(
      airdropMemberRepository.getAirdropMembersByMessageId(
        activeAirdrop.messageId
      )
    ).resolves.toEqual([]);

    await expect(
      airdropRepository.getActiveAirdropById(activeAirdrop.messageId)
    ).resolves.toBeNull();
  });
});
