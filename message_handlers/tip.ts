import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { WalletService } from "services/wallet-service";
import { MessageHandler } from "./types";
import web3 from "services/web3";
import { TransactionService } from "services/transaction-service";
import { TransactionConfig } from "web3-core";
import { CallbackData } from "callback_handlers/enums";
import {
  BotMessageService,
  MessageConfigI,
} from "services/bot-message-service";

export class TipMessageHandler implements MessageHandler {
  identifier = /\/tip*/g;

  constructor(
    private walletService: WalletService,
    private transactionService: TransactionService,
    private botMessageService: BotMessageService
  ) {}

  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      message_id,
      chat: { id },
      text,
    } = update.message!;
    const username = update.message!.from!.username;

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

    const tipperWallet = await this.walletService.getWallet(username);

    if (!tipperWallet) {
      await this.botMessageService.noWalletMsg(botMessageConfig);
      return;
    }

    if (!web3.utils.isAddress(tipperWallet.address)) {
      await this.botMessageService.invalidAddressMsg(
        tipperWallet.address,
        botMessageConfig
      );
      return;
    }

    const tokens = (text ?? "").split(" ");

    if (tokens.length !== 3) {
      await this.botMessageService.invalidArgumentLengthMsg(
        `${text}`,
        botMessageConfig
      );
      return;
    }

    const [_, rawRecipientUsername, amountInText] = (text ?? "").split(" ");

    const amount = Number(amountInText);
    if (isNaN(amount) || amount <= 0) {
      await this.botMessageService.invalidAmountTextMsg(
        amountInText,
        botMessageConfig
      );
      return;
    }

    const isBalanceSufficient =
      await this.transactionService.validateSufficientBalance(
        tipperWallet.address,
        amount
      );

    if (!isBalanceSufficient) {
      await this.botMessageService.insufficientBalance(botMessageConfig);
      return;
    }

    const recipientUsername = this.parseRecipientUsername(rawRecipientUsername);

    let recipientWallet = await this.walletService.getOrCreateWallet(
      recipientUsername
    );

    if (!recipientWallet) {
      const message = "Failed to get recipient wallet.";
      await bot.sendMessage(id, message, sendMessageConfig);
      return;
    }

    if (!web3.utils.isAddress(recipientWallet.address)) {
      await this.botMessageService.invalidAddressMsg(
        recipientWallet.address,
        botMessageConfig
      );
      return;
    }

    const transactionConfig =
      await this.transactionService.getTransactionConfig(
        recipientWallet.address,
        amount
      );

    const signedTransaction = await this.transactionService.signTransaction(
      tipperWallet.privateKey,
      transactionConfig
    );

    let message = this.generateBotMessage(
      rawRecipientUsername,
      transactionConfig,
      signedTransaction.rawTransaction!
    );

    bot.sendMessage(id, message, {
      parse_mode: "Markdown",
      reply_to_message_id: message_id,
      reply_markup: this.botMessageService.confirmTxReplyMarkup,
    });
  }

  generateBotMessage(
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

  parseRecipientUsername(username: string): string {
    const regexp = /[^\w\s]/gi;
    return username.replace(regexp, "");
  }
}
