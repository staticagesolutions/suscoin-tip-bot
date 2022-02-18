import TelegramBot, { Update } from "node-telegram-bot-api";
import { invitedToGroup } from "./group-invited";
import { help } from "./help";
import { tip } from "./tip";

export const handleGroupMessage = async (bot: TelegramBot, update: Update) => {
  const { text, group_chat_created } = update.message!;
  console.log("Group Message Text:", text);

  const isBotInvited = await isBotNewlyInvited(bot, update);
  if (group_chat_created || isBotInvited) {
    return await invitedToGroup(bot, update);
  }
  const command = text ?? "";
  if (/\/help/g.test(command)) {
    await help(bot, update);
  } else if (/\/tip/g.test(command)) {
    await tip(bot, update);
  }
  return;
};

async function isBotNewlyInvited(bot: TelegramBot, update: Update) {
  const { new_chat_members } = update.message!;
  if(!new_chat_members){
    return false;
  }
  const botUsername = (await bot.getMe()).username!;
  const isBotInvited = new_chat_members.find(
    (member) => member.username === botUsername
  );

  return isBotInvited;
}
