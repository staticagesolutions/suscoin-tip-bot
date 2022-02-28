import { BotCommand } from "node-telegram-bot-api";

const standardCommands: BotCommand[] = [
  {
    command: "/commands",
    description: "Display bot commands.",
  },
  {
    command: "/help",
    description: "Display information about Sysbot.",
  },
];

const privateChatCommands: BotCommand[] = [
  {
    command: "/start",
    description: "Start Syscoin Tip Bot",
  },
  ...standardCommands,
  {
    command: "/send",
    description: "<address> <amount> : Sends token to an address with the specified amount.",
  },
  {
    command: "/wallet_info",
    description: "Display your wallet information.",
  },
];
const groupCommands: BotCommand[] = [
  ...standardCommands,
  {
    command: "/tip",
    description:
      "<amount> : Reply to a message with amount and directly send a tip to user.",
  },
  {
    command: "/register",
    description: "Register to participate future airdrops in this group.",
  },
];

const adminGroupCommands: BotCommand[] = [
  ...groupCommands,
  {
    command: "/airdrop",
    description:
      "<amount> <count> : Sends airdrop randomly to registered members.",
  },
  {
    command: "/active_airdrop",
    description:
      "<amount> <count> : Sends airdrop to number of active-airdrop participants.",
  },
];

export const botCommands = {
  standardCommands,
  privateChatCommands,
  groupCommands,
  adminGroupCommands,
};
