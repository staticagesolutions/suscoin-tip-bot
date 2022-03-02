import TelegramBot, { Update } from "node-telegram-bot-api";
import { activeAirdropService, groupMemberService } from "services";
import groupHandlerUtils from "./group-handler-utils";

export const countMembers = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id },
    from,
  } = update.message!;

  const userId = from?.id;

  if (!userId) {
    console.error("No User Id!", update);
    throw new Error("No User Id found");
  }

  const isAdmin = await groupHandlerUtils.isAdmin(userId, id, bot);

  if (!isAdmin) {
    console.error("Is not an admin");
    return;
  }

  const registeredMembers = (await groupMemberService.getGroupChatMembers(id))
    ?.length ?? "0";
  const chatAdmins = (await bot.getChatAdministrators(id)).length;
  const groupChatCount = (await bot.getChatMembersCount(id)) - (chatAdmins + 1);
  let activeAirdrops = await activeAirdropService.getActiveAirdropsByChatId(id);
  let airdrops = "\t\t\tNo active airdrops";
  if (activeAirdrops && activeAirdrops.length > 0) {
    const token = "SYS";
    airdrops = activeAirdrops
      .map((am) => {
        const participants = am.ActiveAirdropMember.length;
        const count = am.count;
        const amount = am.amount;

        return `\t\t\t•\t\t${amount} ${token} shared among ${count} winners- ${participants} joined`;
      })
      .join("\n");
  }

  const message = `Currently registered members:\n\t\t\t•\t\t${registeredMembers}/${groupChatCount}\n\nActive-Airdrops:\n${airdrops}`;
  await bot.sendMessage(id, message);
};
