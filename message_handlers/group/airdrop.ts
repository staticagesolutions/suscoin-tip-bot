import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import {
  botMessageService,
  groupMemberService,
  transactionService,
  walletService,
} from "services";
import { MessageConfigI } from "services/bot-message-service";
import web3 from "services/web3";

import { TransactionConfig } from "web3-core";
import groupHandlerUtils from "./group-handler-utils";

export const airdrop = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id, title },
    from,
    text,
  } = update.message!;

  const userId = from?.id;

  if (!userId) {
    console.error("No User Id!", update);
    throw new Error("No User Id found");
  }

  const isAdmin = await groupHandlerUtils.isAdmin(userId, id, bot);

  if (!isAdmin) {
    console.error("Not an admin.", update);
    return;
  }

  const sendMessageConfig: SendMessageOptions = {
    parse_mode: "Markdown",
  };

  const botMessageConfig: MessageConfigI = {
    bot,
    chatId: id,
    sendMessageConfig,
  };

  const wallet = await walletService.getWallet(userId);

  if (!wallet) {
    await botMessageService.noWalletMsg(botMessageConfig);
    return;
  }

  const tokens = (text ?? "").split(" ");

  if (tokens.length !== 3) {
    await botMessageService.invalidArgumentLengthMsg(
      `${text}`,
      botMessageConfig
    );
    return;
  }

  const [_, amountInText, numberWinnersInText] = (text ?? "").split(" ");

  const amount = Number(amountInText);
  const numberOfWinners = Number(numberWinnersInText);
  if (isNaN(amount) || amount <= 0) {
    await botMessageService.invalidAmountTextMsg(
      amountInText,
      botMessageConfig
    );
    return;
  }

  if (isNaN(numberOfWinners) || numberOfWinners <= 0) {
    await botMessageService.invalidAmountTextMsg(
      numberWinnersInText,
      botMessageConfig
    );
    return;
  }
  console.log(id);
  const members = await groupMemberService.getGroupChatMembers(id);

  if (!members) {
    await bot.sendMessage(
      userId,
      `There are no users registered in the group chat: ${title}`
    );
    throw new Error("No members found");
  }

  if (members?.length < numberOfWinners) {
    await bot.sendMessage(
      id,
      "Number of currently registered members is lower than specified number of winners"
    );
    return;
  }

  const addresses = await groupHandlerUtils.selectWinners(
    numberOfWinners,
    members
  );

  let data = transactionService.airDrop(addresses);

  const transactionConfig =
    await transactionService.getTransactionConfigForContract(amount, data);

  const signedTransaction = await transactionService.signTransaction(
    wallet.privateKey,
    transactionConfig
  );

  let message = generateBotMessage(
    addresses,
    transactionConfig,
    signedTransaction.rawTransaction!
  );

  await bot.sendMessage(from!.id, message, {
    parse_mode: "Markdown",
    reply_markup: botMessageService.confirmTxReplyMarkup,
  });
};

function generateBotMessage(
  addresses: string[],
  transactionConfig: TransactionConfig,
  rawTransaction: string
) {
  const amountFromWei = web3.utils.fromWei(
    transactionConfig.value!.toString(),
    "ether"
  );

  return `Confirming your transaction:\n\nWinners: \`${addresses.toString()}\`\n\nContract Address: ${
    transactionConfig.to
  }\n\nAmount: ${amountFromWei}\n\nPlease reply "yes" to this message to confirm.\n\n\nRAW Transaction: ${rawTransaction}`;
}
