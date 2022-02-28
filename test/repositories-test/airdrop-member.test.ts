import { ActiveAirdrop, ActiveAirdropMember } from "@prisma/client";
import { resetData } from "../utils";
import testData from "../test-data";
import airdropRepository from "../../repositories/active-airdrop.repository";
import activeAirdropRepository from "../../repositories/airdrop-member.repository";

jest.setTimeout(20000);
beforeAll(async () => {
  await resetData();
});

describe("Validate Logic of AirdropMemberRepository", () => {
  test("should register to an active-airdrop", async () => {
    const activeAirdrop: ActiveAirdrop = {
      amount: 4,
      count: 2,
      chatId: BigInt(-4000),
      messageId: BigInt(-4000),
    };

    await airdropRepository.createActiveAirdrop(
      activeAirdrop.amount,
      activeAirdrop.count,
      activeAirdrop.chatId,
      activeAirdrop.messageId
    );

    const airdropMember: ActiveAirdropMember = {
      messageId: activeAirdrop.messageId,
      groupChatId: activeAirdrop.chatId,
      userId: testData.activeAirdropMember[0].userId,
    };

    const createdAirdropMember =
      await activeAirdropRepository.createActiveAirdropMember(
        activeAirdrop.messageId,
        activeAirdrop.chatId,
        airdropMember.userId
      );

    expect<ActiveAirdropMember>(airdropMember).toEqual(createdAirdropMember);
  });
});
