import TelegramBot, { Update } from "node-telegram-bot-api";
import { groupMemberService } from "services";
import groupHandlerUtils from "./group-handler-utils";
export const register = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id, title },
    from,
  } = update.message!;

  const userId = from?.id;

  if (!userId) {
    console.error("No User Id!", update);
    throw new Error("No User Id found");
  }

  const isAdmin = await groupHandlerUtils.isAdmin(userId, id, bot);

  if (isAdmin) {
    console.error("Is an admin", update);
    return;
  }

  const isRegistered = await groupMemberService.checkMemberRegistered(update);

  if (isRegistered) {
    await bot.sendMessage(userId, `Already registered to ${title}'s airdrop`);
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
