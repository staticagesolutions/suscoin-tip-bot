import {
  ActiveAirdrop,
  ActiveAirdropMember,
  GroupChat,
  GroupChatMember,
} from "@prisma/client";

type TestData = {
  groupChatMember: Array<GroupChatMember>;
  groupChat: Array<GroupChat>;
  activeAirdrop: Array<ActiveAirdrop>;
  activeAirdropMember: Array<ActiveAirdropMember>;
};

const testData: TestData = {
  activeAirdropMember: [
    {
      messageId: BigInt(1),
      groupChatId: BigInt(1),
      userId: BigInt(1),
    },
    {
      messageId: BigInt(2),
      groupChatId: BigInt(2),
      userId: BigInt(2),
    },
    {
      messageId: BigInt(3),
      groupChatId: BigInt(3),
      userId: BigInt(3),
    },
  ],
  activeAirdrop: [
    {
      messageId: BigInt(1),
      chatId: BigInt(1),
      amount: 100,
      count: 2,
    },
    {
      messageId: BigInt(2),
      chatId: BigInt(2),
      amount: 200,
      count: 2,
    },
    {
      messageId: BigInt(3),
      chatId: BigInt(3),
      amount: 300,
      count: 2,
    },
  ],
  groupChat: [
    {
      chatId: BigInt(1),
      title: "Title 1",
      createAt: new Date(),
      updatedAt: new Date(),
    },
    {
      chatId: BigInt(2),
      title: "Title 2",
      createAt: new Date(),
      updatedAt: new Date(),
    },
    {
      chatId: BigInt(3),
      title: "Title 3",
      createAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  groupChatMember: [
    {
      groupChatId: BigInt(1),
      userId: BigInt(1),
      username: "raphaelmans",
    },
    {
      groupChatId: BigInt(2),
      userId: BigInt(2),
      username: "ejoantonio",
    },
    {
      groupChatId: BigInt(3),
      userId: BigInt(3),
      username: "xerasag",
    },
    {
      groupChatId: BigInt(4),
      userId: BigInt(4),
      username: "xiasagz",
    },
    {
      groupChatId: BigInt(5),
      userId: BigInt(5),
      username: "lalabear",
    },
    {
      groupChatId: BigInt(-1999),
      userId: BigInt(999),
      username: "osmlowis",
    },
    {
      groupChatId: BigInt(-2000),
      userId: BigInt(1000),
      username: "ksuteben",
    },
  ],
};

export default testData;
