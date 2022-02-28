import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { botCommands } from "../../shared/utils";
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
    isAdmin = await groupHandlerUtils.isAdmin(from!.id, id, bot) !== undefined;
    if (isAdmin) {
      commands = botCommands.adminGroupCommands;
    }
  }

  const stringifyCommands = commands
    .map((cm) => {
      const parseDescription = cm.description.split(":");
      let m = `${cm.command} - ${cm.description}`;
      if (parseDescription.length === 2) {
        const [commandSyntax, ...rest] = parseDescription;
        m = `${cm.command} ${commandSyntax} - ${rest}`;
      }
      return m;
    })
    .join("\n");

  await bot.sendMessage(id, `Bot Commands (${isAdmin ? "Admin" : "Member"}):\n${stringifyCommands}`);
};
