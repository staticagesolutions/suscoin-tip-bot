import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
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

  const username = from!.username;

  if (!username) {
    console.error("No username found.", update);
    return;
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

  const tipperWallet = await walletService.getWallet(username);

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

  if (tokens.length !== 2) {
    await botMessageService.invalidArgumentLengthMsg(
      `${text}`,
      botMessageConfig
    );
    return;
  }
  const [_, amountInText] = (text ?? "").split(" ");

  const { message_id: replyMessageId, from: replyFrom } = reply_to_message;

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

  const recipientUsername = replyFrom!.username;

  if (!recipientUsername) {
    await botMessageService.noRecipientUsernameMsg(botMessageConfig);
    return;
  }
  let recipientWallet = await walletService.getOrCreateWallet(
    recipientUsername
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
    await transactionService.getTransactionConfigForContract(amount, data);


  const signedTransaction = await transactionService.signTransaction(
    tipperWallet.privateKey,
    transactionConfig
  );

  let message = generateBotMessage(
    username,
    transactionConfig,
    signedTransaction.rawTransaction!
  );

  await bot.sendMessage(from!.id, message, {
    parse_mode: "Markdown",
    reply_markup: botMessageService.confirmTxReplyMarkup,
  });
};

function generateBotMessage(
  recipientUsername: string,
  transactionConfig: TransactionConfig,
  rawTransaction: string
) {
  const amountFromWei = web3.utils.fromWei(
    transactionConfig.value!.toString(),
    "ether"
  );

  return `Confirming your transaction:\n\nUsername: ${recipientUsername}\nAddress: ${transactionConfig.to}\nAmount: ${amountFromWei}\n\nPlease reply "yes" to this message to confirm.\n\n\nRAW Transaction: ${rawTransaction}`;
}
