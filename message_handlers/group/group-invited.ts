import TelegramBot, {
  Update,
  BotCommandScopeAllGroupChats,
  BotCommand,
} from "node-telegram-bot-api";

import db from "@db";

export const invitedToGroup = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id, title },
  } = update.message!;

  if (!title) {
    console.error("Invited to Group Error: Missing title");
    return;
  }
  const exists = await db.groupChat.findFirst({ where: { chatId: id } });
  if (exists) {
    return true;
  }
  await db.groupChat.create({ data: { chatId: id, title } });
  const groupCommands: BotCommand[] = [
    {
      command: "/help",
      description: "Description for help here",
    },
    {
      command: "/tip",
      description: "Description for help here",
    },
  ];
  await bot.setMyCommands(groupCommands, {
    scope: {
      type: "all_group_chats",
    },
  });
  await bot.setMyCommands(
    [
      ...groupCommands,
      {
        command: "/airdop",
        description: "Sends airdrop randomly to X people",
      },
    ],
    {
      scope: {
        type: "all_chat_administrators",
      },
    }
  );

  console.log(`Invited to Group: [${id}] \"${title}\"`);
};
