import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import {
  BotMessageService,
  MessageConfigI,
} from "services/bot-message-service";
import { TransactionService } from "services/transaction-service";
import { WalletService } from "services/wallet-service";
import web3 from "services/web3";
import { TransactionConfig } from "web3-core";
import { MessageHandler } from "./types";


export class SendMessageHandler implements MessageHandler {
  identifier = /\/send*/g;

  constructor(
    private walletService: WalletService,
    private transactionService: TransactionService,
    private botMessageService: BotMessageService
  ) {}

  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {

    const {
      message_id,
      chat: { id, username },
      text,
    } = update.message!;
    const sendMessageConfig: SendMessageOptions = {
      parse_mode: "Markdown",
      reply_to_message_id: message_id,
    };

    const botMessageConfig: MessageConfigI = {
      bot,
      chatId: id,
      sendMessageConfig,
    };

    if (!username) {
      console.error("No username found.", update);
      return;
    }
    const wallet = await this.walletService.getWallet(username);

    if (!wallet) {
      await this.botMessageService.noWalletMsg(botMessageConfig);
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

    const [_, address, amountInText] = (text ?? "").split(" ");

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
        wallet.address,
        amount
      );

    if (!isBalanceSufficient) {
      await this.botMessageService.insufficientBalance(botMessageConfig);
      return;
    }

    if (!web3.utils.isAddress(address)) {
      await this.botMessageService.invalidAddressMsg(address, botMessageConfig);
      return;
    }

    const account = web3.eth.accounts.privateKeyToAccount(wallet.privateKey);

    const transactionConfig =
      await this.transactionService.getTransactionConfig(address, amount);

    const signedTransaction = await account.signTransaction(transactionConfig);

    if (!signedTransaction.rawTransaction) {
      bot.sendMessage(id, "Failed to sign transaction.", sendMessageConfig);
      return;
    }

    let message = this.generateBotMessage(
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
    transactionConfig: TransactionConfig,
    rawTransaction: string
  ) {
    const amountFromWei = web3.utils.fromWei(
      transactionConfig.value!.toString(),
      "ether"
    );

    return `Confirming your transaction:\n\nAddress: ${transactionConfig.to}\nAmount: ${amountFromWei}\n\nPlease reply "yes" to this message to confirm.\n\n\nRAW Transaction: ${rawTransaction}`;
  }
}
