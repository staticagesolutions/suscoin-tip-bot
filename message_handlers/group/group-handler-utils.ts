import { GroupChatMember } from "@prisma/client";
import TelegramBot from "node-telegram-bot-api";
import { walletService } from "services";

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function selectWinners(
  numberOfWinners: number,
  members: Array<GroupChatMember>
) {
  const winners: Array<GroupChatMember> = [];

  while (winners.length !== numberOfWinners) {
    const rand = getRandomInt(0, members.length - 1);
    const chosen = members[rand];
    const exist = winners.find((m) => chosen.userId === m.userId);
    if (!exist) {
      winners.push(members[rand]);
    }
  }
  return getAddresses(winners);
}

async function getAddresses(winners: GroupChatMember[]) {
  return await Promise.all(
    winners.map(async (winner) => {
      const wallet = await walletService.getOrCreateWallet(winner.username);
      return wallet!.address;
    })
  );
}

async function isAdmin(username: string, chatId: number, bot: TelegramBot) {
  const administrators = await bot.getChatAdministrators(chatId);

  const isAdmin = administrators.find((admin) => {
    return admin.user.username === username;
  });
  return isAdmin;
}

const groupHandlerUtils = {
  selectWinners,
  isAdmin,
  getAddresses,
};

export default groupHandlerUtils;
