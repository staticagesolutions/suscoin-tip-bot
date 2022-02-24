import groupHandlerUtils from "message_handlers/group/group-handler-utils";
import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import {
  activeAirdropService,
  botMessageService,
  groupMemberService,
  transactionService,
  walletService,
} from "services";
import { MessageConfigI } from "services/bot-message-service";
import web3 from "services/web3";
import { TransactionConfig } from "web3-core";
import { CallbackData } from "./enums";
import { CallbackHandler } from "./types";

export class CloseAirdropCallbackHandler implements CallbackHandler {
  callbackData = CallbackData.CloseAirdrop;
  async handleCallback(bot: TelegramBot, update: Update): Promise<void> {
    const callbackQuery = update.callback_query!;

    if (!callbackQuery) {
      throw new Error("Callback Query not found");
    }
    const { message, from } = callbackQuery;

    const userId = from?.id;
    const chatId = message!.chat.id;
    const sendMessageConfig: SendMessageOptions = {
      parse_mode: "Markdown",
    };

    const botMessageConfig: MessageConfigI = {
      bot,
      chatId,
      sendMessageConfig,
    };

    if (!userId) {
      console.error("No User Id!", update);
      throw new Error("No User Id found");
    }
    const isAdmin = await groupHandlerUtils.isAdmin(userId, chatId, bot);
    if (!isAdmin) {
      console.error("User is not an admin");
      return;
    }

    const messageId = message!.message_id;
    const activeAirdrop = await activeAirdropService.getActiveAirdrop(
      messageId
    );

    if (!activeAirdrop) {
      console.error(`No active airdrop with message_id: ${messageId}`);
      return;
    }

    const groupMembers = await groupMemberService.getGroupChatMembers(
      Number(activeAirdrop.chatId)
    );
    if (!groupMembers) {
      throw new Error("No members found");
    }

    const airdropMembers = await groupMemberService.getActiveMembers(
      chatId,
      messageId
    );

    const members = groupMembers.filter((member) => {
      return airdropMembers.find(
        (dropMember) => member.userId === dropMember.userId
      );
    });

    if (members.length === 0) {
      await bot.sendMessage(
        from!.id,
        "There are currently 0 participants in your airdrop",
        sendMessageConfig
      );
      return;
    }

    const addresses = await groupHandlerUtils.getAddresses(members);

    const wallet = await walletService.getWallet(userId);

    if (!wallet) {
      await botMessageService.noWalletMsg(botMessageConfig);
      return;
    }

    const amount = Number(activeAirdrop.amount);
    if (isNaN(amount) || amount <= 0) {
      console.error(`Invalid amount: ${amount}`);
      return;
    }

    const isBalanceSufficient =
      await transactionService.validateSufficientBalance(
        wallet.address,
        amount
      );

    if (!isBalanceSufficient) {
      await botMessageService.insufficientBalance(botMessageConfig);
      return;
    }

    let data = transactionService.airDrop(addresses);

    const transactionConfig =
      await transactionService.getTransactionConfigForContract(amount, data);

    const signedTransaction = await transactionService.signTransaction(
      wallet.privateKey,
      transactionConfig
    );

    let botMessage = generateBotMessage(
      addresses,
      transactionConfig,
      signedTransaction.rawTransaction!
    );

    await bot.sendMessage(from!.id, botMessage, {
      parse_mode: "Markdown",
      reply_markup: botMessageService.confirmAirdropReplyMarkup(messageId),
    });
  }
}

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
