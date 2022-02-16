import TelegramBot, { Update } from "node-telegram-bot-api";
import { CallbackHandler } from "./types";

import web3 from "services/web3";
import { WalletService } from "services/wallet-service";
import { CallbackData } from "./enums";

export class BalanceCallbackHandler implements CallbackHandler {
  callbackData = CallbackData.CheckBalance;

  constructor(private walletService: WalletService) {}

  async handleCallback(bot: TelegramBot, update: Update): Promise<void> {
    const {
      chat: { id, username },
    } = update.callback_query!.message!;
    
    if (!username) {
      console.error("No username found.", update);
      return;
    }
    const wallet = await this.walletService.getWallet(username);
    if (!wallet) {
      bot.sendMessage(id, "No wallet created yet.");
      return;
    }
    const balance = await web3.eth.getBalance(wallet.address);

    bot.sendMessage(id, `Balance:\t\t${web3.utils.fromWei(balance)}`);
  }
}
