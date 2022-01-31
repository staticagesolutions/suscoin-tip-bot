import TelegramBot, { Update } from "node-telegram-bot-api";
import { MessageHandler } from "./types";

import web3 from "services/web3";
import { WalletService } from "services/wallet-service";

export class BalanceMessageHandler implements MessageHandler {
  identifier = /\/balance*/g;

  constructor(private walletService: WalletService) {}

  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      chat: { id, username },
    } = update.message!;
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
