import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { MessageHandler } from "./types";

import web3 from "services/web3";
import { WalletService } from "services/wallet-service";

export class CreateWalletMessageHandler implements MessageHandler {
  identifier = /\/create_wallet|✅ I understand*/g;

  constructor(private walletService: WalletService) {}

  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const { chat, from } = update.message!;
    const { id: chatId, username } = chat;
    const userId = from?.id;
    if (!userId) {
      console.error("No User Id!", update);
      throw new Error("No User Id found");
    }

    const sendMessageConfig: SendMessageOptions = {
      parse_mode: "Markdown",
      reply_markup: {
        resize_keyboard: true,
        keyboard: [
          [
            {
              text: "❓ Help",
            },
          ],
          [
            {
              text: "🏦 Wallet Info",
            },
          ],
        ],
      },
    };

    const walletExists = await this.walletService.checkIfExist(userId);
    if (walletExists) {
      await bot.sendMessage(
        chatId,
        "You have an existing wallet.",
        sendMessageConfig
      );
      return;
    }

    const account = web3.eth.accounts.create();
    const { address, privateKey } = account;
    await this.walletService.saveWallet(userId, account, username);
    const message = `Address:\t\t${address}\nPrivateKey:\t\t${privateKey}`;
    await bot.sendMessage(chatId, message, sendMessageConfig);
  }
}
