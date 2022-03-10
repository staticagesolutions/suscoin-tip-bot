import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import {
  botMessageService,
  groupMemberService,
  transactionService,
  walletService,
} from "services";
import { MessageConfigI } from "services/bot-message-service";
import { generateAirdropMessage } from "shared/utils";

import groupHandlerUtils from "./group-handler-utils";

export const airdrop = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id, title },
    from,
    text,
    message_id,
  } = update.message!;

  const userId = from?.id;

  if (!userId) {
    console.error("No User Id!", update);
    throw new Error("No User Id found");
  }

  const isAdmin = true; // await groupHandlerUtils.isAdmin(userId, id, bot);

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

  const tokens = (text ?? "").split(" ");

  const properSyntax = "Must be: `/airdrop <amount> <count>`";

  if (tokens.length !== 3) {
    await bot.sendMessage(
      id,
      `*Invalid Syntax*:\n${properSyntax}`,
      sendMessageConfig
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

  const wallet = await walletService.getWallet(userId);

  if (!wallet) {
    await botMessageService.noWalletMsg(botMessageConfig);
    return;
  }

  const addresses = await groupHandlerUtils.selectWinners(
    numberOfWinners,
    members
  );

  let data = transactionService.airDrop(addresses);

  const transactionConfig =
    await transactionService.getTransactionConfigForContract(amount, data, wallet.address);

  const signedTransaction = await transactionService.signTransaction(
    wallet.privateKey,
    transactionConfig
  );

  let message = generateAirdropMessage(
    addresses,
    transactionConfig,
    signedTransaction.rawTransaction!
  );

  await bot.sendMessage(from!.id, message, {
    parse_mode: "Markdown",
    reply_markup: botMessageService.confirmTxReplyMarkupWithActionType(
      "airdrop",
      id,
      message_id
    ),
  });
};
