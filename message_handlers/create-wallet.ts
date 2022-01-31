import TelegramBot, { Update } from "node-telegram-bot-api";
import { MessageHandler } from "./types";

import web3 from "services/web3";
import { WalletService } from "services/wallet-service";

export class CreateWalletMessageHandler implements MessageHandler {
  identifier = /\/create_wallet*/g;

  constructor(private walletService: WalletService) {}

  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const { message_id, chat } = update.message!;
    const { id: chatId, username } = chat;
    if (!username) {
      console.error("No username!", update);
      throw new Error("Invalid Update. No Username");
    }

    const walletExists = await this.walletService.checkIfExist(username);
    if (walletExists) {
      await bot.sendMessage(chatId, "Wallet already exists", {
        reply_to_message_id: message_id,
      });
      return;
    }

    const account = web3.eth.accounts.create();
    const { address, privateKey } = account;
    await this.walletService.saveWallet(username, account);
    const message = `Address:\t\t${address}\nPrivateKey:\t\t${privateKey}`;
    await bot.sendMessage(chatId, message);
  }

}
