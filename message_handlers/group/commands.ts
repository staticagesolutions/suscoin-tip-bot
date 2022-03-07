import TelegramBot, { Update } from "node-telegram-bot-api";
import { botCommands, stringifyBotCommands } from "../../shared/utils";
import groupHandlerUtils from "./group-handler-utils";

export const commands = async (
  bot: TelegramBot,
  update: Update
): Promise<void> => {
  const {
    chat: { id },
    from,
  } = update.message!;

  let commands = botCommands.groupCommands;

  let isAdmin = false;
  if (from?.id) {
    isAdmin =
      (await groupHandlerUtils.isAdmin(from!.id, id, bot)) !== undefined;
    if (isAdmin) {
      commands = botCommands.adminGroupCommands;
    }
  }

  const stringifyCommands = stringifyBotCommands(commands);

  await bot.sendMessage(
    id,
    `Bot Commands (${isAdmin ? "Admin" : "Member"}):\n${stringifyCommands}`
  );
};
