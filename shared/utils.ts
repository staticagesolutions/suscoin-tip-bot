import { BotCommand } from "node-telegram-bot-api";
import { walletService } from "services";
import web3 from "services/web3";
import { TransactionConfig } from "web3-core";

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
    description:
      "<address> <amount> : Sends token to an address with the specified amount.",
  },
  {
    command: "/wallet_info",
    description: "Display your wallet information.",
  },
  {
    command: "/delete_wallet",
    description: "Delete your wallet permanently.",
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
  {
    command: "/count_members",
    description: "Display registered members and active-airdrop participants.",
  },
];

export const stringifyBotCommands = (commands: BotCommand[]) => {
  return commands
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
};

export function generateAirdropMessage(
  addresses: string[],
  transactionConfig: TransactionConfig,
  rawTransaction: string
) {
  const amountFromWei = web3.utils.fromWei(
    transactionConfig.value!.toString(),
    "ether"
  );

  return `Confirming your transaction:\n\nWinners: \`${addresses}\`\n\nContract Address: ${transactionConfig.to}\n\nAmount: ${amountFromWei}\n\nPlease reply "yes" to this message to confirm.\n\n\nRAW Transaction: ${rawTransaction}`;
}

export const getAirdropWinners = async (tokens: string[]) => {
  const t = tokens.find((t) => t.includes("Winners"));
  const addresses = t?.split(":")[1].trim().split(",");
  addresses?.map((addr) => {
    if (!web3.utils.isAddress(addr)) {
      throw new Error(`${addr} is not a valid address`);
    }
    return;
  });
  return (
    await Promise.all(
      addresses?.map(async (addr) => {
        const wallet = await walletService.getWalletByAddress(addr);
        return `@${wallet?.username} - ${wallet?.address}`;
      })!
    )
  ).join("\n");
};

export const getContractAddressLink = () => {
  const explorerLink =
    process.env.EXPLORER_LINK ?? "https://explorer.syscoin.org";
  return `${explorerLink}/address/${process.env.CONTRACT_ADDRESS}`;
};

export const botCommands = {
  standardCommands,
  privateChatCommands,
  groupCommands,
  adminGroupCommands,
};
