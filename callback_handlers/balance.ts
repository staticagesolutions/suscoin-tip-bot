import TelegramBot, { Update } from "node-telegram-bot-api";
import { CallbackHandler } from "./types";

import web3 from "services/web3";
import { WalletService } from "services/wallet-service";
import { CallbackData } from "./enums";

export class BalanceCallbackHandler implements CallbackHandler {
  callbackData = CallbackData.CheckBalance;

  constructor(private walletService: WalletService) {}

  async handleCallback(bot: TelegramBot, update: Update): Promise<void> {
    const { message, from } = update.callback_query!;

    const {
      chat: { id },
    } = message!;

    const userId = from?.id;

    if (!userId) {
      console.error("No User Id!", update);
      throw new Error("No User Id found");
    }

    const wallet = await this.walletService.getWallet(userId);
    if (!wallet) {
      bot.sendMessage(id, "No wallet created yet.");
      return;
    }
    const balance = await web3.eth.getBalance(wallet.address);

    bot.sendMessage(id, `Balance:\t\t${web3.utils.fromWei(balance)}`);
  }
}
