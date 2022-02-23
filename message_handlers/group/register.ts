import TelegramBot, { Update } from "node-telegram-bot-api";
import { groupMemberService } from "services";
export const register = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id, title },
    from,
  } = update.message!;

  const userId = from!.id;
  const username = from!.username;
  const administrators = await bot.getChatAdministrators(id);

  const isAdmin = administrators.find((admin) => {
    return admin.user.username === username;
  });

  if (isAdmin) {
    return;
  }

  const isRegistered = await groupMemberService.checkMemberRegistered(update);

  if (isRegistered) {
    await bot.sendMessage(userId, `to ${title}'s airdrop`);
    return;
  }
  const registerUser = await groupMemberService.registerMember(update);

  if (!registerUser) {
    await bot.sendMessage(userId, `Failed to register to ${title}'s airdrop`);
    return;
  }

  await bot.sendMessage(
    userId,
    `You have participated to ${title}'s future airdrops!`
  );
};
