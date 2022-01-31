import TelegramBot, { Update } from "node-telegram-bot-api";
import { WalletService } from "services/wallet-service";
import { MessageHandler } from "./types";

export class WalletInfoMessageHandler implements MessageHandler {
  identifier = /\/wallet_info/g;
  constructor(private walletService: WalletService) {}
  async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
    const {
      message_id,
      chat: { id, username },
    } = update.message!;

    if (!username) {
      console.error("No username found.", update);
      return;
    }
    const wallet = await this.walletService.getWallet(username);
    let message = `*${username}* is currently not registered.`;
    if (wallet) {
      message = `Address: ${wallet.address}`;
    }
    await bot.sendMessage(id, message, {
      parse_mode: "Markdown",
      reply_to_message_id: message_id,
    });
  }
}
