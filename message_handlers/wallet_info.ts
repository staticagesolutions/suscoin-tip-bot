import { CallbackData } from "callback_handlers/enums";
import TelegramBot, { Update } from "node-telegram-bot-api";
import { WalletService } from "services/wallet-service";
import { MessageHandler } from "./types";

export class WalletInfoMessageHandler implements MessageHandler {
  identifier = /\/wallet_info|🏦 Wallet Info/g;
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
    let message = `*${username}* is currently not registered.`;
    if (!wallet) {
      await bot.sendMessage(id, "No wallet created yet.");
      return;
    }
    const walletLink = `${process.env.EXPLORER_LINK}/address/${
      wallet!.address
    }`;
    message = `*SYS*\nAddress: \`${wallet.address}\`\n[Go to explorer](${walletLink})`;
    await bot.sendMessage(id, message, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Check balance 💰",
              callback_data: CallbackData.CheckBalance,
            },
            {
              text: "Reveal Private Key 🔑",
              callback_data: CallbackData.RevealPrivateKey,
            }
          ],
        ],
      },
      disable_web_page_preview: true,
    });
  }
}
