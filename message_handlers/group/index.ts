import TelegramBot, { Update } from "node-telegram-bot-api";
import { invitedToGroup } from "./group-invited";
import { help } from "./help";
import { tip } from "./tip";

export const handleGroupMessage = async (bot: TelegramBot, update: Update) => {
  const { text, group_chat_created } = update.message!;
  console.log("Group Message Text:", text);
  if (group_chat_created) {
    return invitedToGroup(bot, update);
  }
  const command = text ?? "";
  if (/\/help/g.test(command)) {
    await help(bot, update);
  } else if (/\/tip/g) {
    await tip(bot, update);
  }
  return;
};
