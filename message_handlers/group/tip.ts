import TelegramBot, {
  SendMessageOptions,
  Update,
  User,
} from "node-telegram-bot-api";
import { botMessageService, transactionService, walletService } from "services";
import { MessageConfigI } from "services/bot-message-service";
import web3 from "services/web3";
import { TransactionConfig } from "web3-core";

export const tip = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id },
    message_id,
    reply_to_message,
    from,
    text,
  } = update.message!;

  if (!reply_to_message) {
    await bot.sendMessage(
      id,
      `@${from?.username} reply to a message and use \`\/tip <amount>\`\\.`,
      {
        reply_to_message_id: message_id,
        parse_mode: "MarkdownV2",
      }
    );
    return;
  }

  if (reply_to_message.from?.is_bot) {
    await bot.sendMessage(id, "You are trying to tip a bot.");
    return;
  }

  const tipperUser = from!;

  if (!tipperUser.id) {
    console.error("No User Id!", update);
    throw new Error("No User Id found");
  }

  const sendMessageConfig: SendMessageOptions = {
    parse_mode: "Markdown",
    reply_to_message_id: message_id,
  };

  const botMessageConfig: MessageConfigI = {
    bot,
    chatId: id,
    sendMessageConfig,
  };

  const tipperWallet = await walletService.getWallet(tipperUser.id);

  if (!tipperWallet) {
    await botMessageService.noWalletMsg(botMessageConfig);
    return;
  }

  if (!web3.utils.isAddress(tipperWallet.address)) {
    await botMessageService.invalidAddressMsg(
      tipperWallet.address,
      botMessageConfig
    );
    return;
  }

  const tokens = (text ?? "").split(" ");
  const properSyntax = "Must be: `/tip <amount>`";
  if (tokens.length !== 2) {
    await bot.sendMessage(
      id,
      `*Invalid Syntax*:\n${properSyntax}`,
      sendMessageConfig
    );
    return;
  }
  const [_, amountInText] = (text ?? "").split(" ");

  const { from: replyFrom } = reply_to_message;

  const amount = Number(amountInText);
  if (isNaN(amount) || amount <= 0) {
    await botMessageService.invalidAmountTextMsg(
      amountInText,
      botMessageConfig
    );
    return;
  }

  const isBalanceSufficient =
    await transactionService.validateSufficientBalance(
      tipperWallet.address,
      amount
    );

  if (!isBalanceSufficient) {
    await botMessageService.insufficientBalance(botMessageConfig);
    return;
  }

  const recipientUser = replyFrom!;

  if (!recipientUser.id) {
    console.error("No User Id!", update);
    throw new Error("No User Id found");
  }
  let recipientWallet = await walletService.getOrCreateWallet(
    recipientUser.id,
    recipientUser.username
  );
  if (!recipientWallet) {
    const message = "Failed to get recipient wallet.";
    await bot.sendMessage(id, message, sendMessageConfig);
    return;
  }
  if (!web3.utils.isAddress(recipientWallet.address)) {
    await botMessageService.invalidAddressMsg(
      recipientWallet.address,
      botMessageConfig
    );
    return;
  }

  let data = transactionService.tipByContract(recipientWallet.address);

  const transactionConfig =
    await transactionService.getTransactionConfigForContract(
      amount,
      data,
      tipperWallet.address
    );

  const signedTransaction = await transactionService.signTransaction(
    tipperWallet.privateKey,
    transactionConfig
  );

  let message = generateBotMessage(
    tipperUser!,
    recipientUser!,
    transactionConfig,
    signedTransaction.rawTransaction!
  );

  await bot.sendMessage(from!.id, message, {
    parse_mode: "Markdown",
    reply_markup: botMessageService.confirmTxReplyMarkupWithActionType(
      "tip",
      id,
      recipientUser.id,
      message_id
    ),
  });
};

function generateBotMessage(
  tipperUser: User,
  recipientUser: User,
  transactionConfig: TransactionConfig,
  rawTransaction: string
) {
  const amountFromWei = web3.utils.fromWei(
    transactionConfig.value!.toString(),
    "ether"
  );
  const from = `${tipperUser.first_name} ${tipperUser.last_name} (@${tipperUser.username})`;

  const to = `${recipientUser.first_name} ${recipientUser.last_name} (@${recipientUser.username})`;

  return `Confirming your transaction:\n\nFrom: ${from}\nTo Username: ${to}\n\nAmount: ${amountFromWei}\n\nPlease reply "yes" to this message to confirm.\n\n\nRAW Transaction: ${rawTransaction}`;
}
