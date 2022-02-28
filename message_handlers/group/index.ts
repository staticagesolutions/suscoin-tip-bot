import TelegramBot, { Update } from "node-telegram-bot-api";
import { groupChatService } from "services";
import { airdrop } from "./airdrop";
import { createActiveAirdrop } from "./airdrop-active";
import { commands } from "./commands";
import groupHandlerUtils from "./group-handler-utils";
import { invitedToGroup } from "./group-invited";
import { help } from "./help";
import { register } from "./register";
import { tip } from "./tip";

export const handleGroupMessage = async (bot: TelegramBot, update: Update) => {
  const { text, group_chat_created, migrate_to_chat_id, chat } =
    update.message!;
  if (migrate_to_chat_id) {
    await groupChatService.migrateGroupChatId(chat.id, migrate_to_chat_id);
    await bot.sendMessage(
      migrate_to_chat_id,
      `There is a change in group settings. All previous active airdrops will be invalid`
    );

    return;
  }

  const isBotInvited = await isBotNewlyInvited(bot, update);
  if (group_chat_created || isBotInvited) {
    return await invitedToGroup(bot, update);
  }
  const command = text ?? "";
  if (/\/help/g.test(command)) {
    await help(bot, update);
  } else if (/\/tip/g.test(command)) {
    await tip(bot, update);
  } else if (/\/register/g.test(command)) {
    await register(bot, update);
  } else if (/\/active_airdrop/g.test(command)) {
    await createActiveAirdrop(bot, update);
  } else if (/\/airdrop/g.test(command)) {
    await airdrop(bot, update);
  } else if (/\/commands/g.test(command)) {
    await commands(bot, update);
  }

  return;
};

async function isBotNewlyInvited(bot: TelegramBot, update: Update) {
  const {
    new_chat_members,
    from,
    chat: { id },
  } = update.message!;
  if (!new_chat_members) {
    return false;
  }
  const botId = (await bot.getMe()).id!;
  const isBotInvited = new_chat_members.find((member) => member.id === botId);

  const isAdmin = await groupHandlerUtils.isAdmin(from!.id, id, bot);

  if (!isAdmin && isBotInvited) {
    await bot.sendMessage(id, "Only Group Admins can add me.");
    await bot.leaveChat(id);
    throw new Error("A member is trying to add a bot");
  }

  return isBotInvited;
}
