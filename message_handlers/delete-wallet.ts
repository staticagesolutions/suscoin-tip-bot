import { CallbackData } from "callback_handlers/enums";
import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import {
  BotMessageService,
  MessageConfigI,
} from "../services/bot-message-service";
import { WalletService } from "../services/wallet-service";
import web3 from "../services/web3";
import { MessageHandler } from "./types";

export class DeleteWalletMessageHandler implements MessageHandler {
  identifier = /\/delete_wallet/g;
  constructor(
    private walletService: WalletService,
    private botMessageService: BotMessageService
  ) {}
  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      chat: { id },
      from,
      message_id,
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

    const userId = from?.id;
    if (!userId) {
      console.error("No User Id!", update);
      throw new Error("No User Id found");
    }

    const wallet = await this.walletService.getWallet(userId);

    if (!wallet) {
      await this.botMessageService.noWalletMsg(botMessageConfig);
      return;
    }

    const balance = await web3.eth.getBalance(wallet.address);

    await bot.sendMessage(
      id,
      `*Confirm Wallet Deletion*\n\nBalance:\t\t${web3.utils.fromWei(balance)}`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Delete permanently ❌",
                callback_data: CallbackData.DeleteWallet,
              },
            ],
          ],
        },
        reply_to_message_id: message_id,
      }
    );
  }
}
