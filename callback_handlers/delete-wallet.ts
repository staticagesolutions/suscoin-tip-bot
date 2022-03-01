import TelegramBot, { Update } from "node-telegram-bot-api";
import { CallbackHandler } from "./types";

import { WalletService } from "services/wallet-service";
import { CallbackData } from "./enums";
import { callbackUtils } from "callback_handlers";

export class DeleteWalletCallbackHandler implements CallbackHandler {
  callbackData = CallbackData.DeleteWallet;

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

    const wallet = await this.walletService.deleteWallet(userId);
    if (!wallet) {
      await bot.sendMessage(id, "Failed to delete wallet.");
      return;
    }

    await bot.sendMessage(id, "Wallet deleted successfully.");
    await callbackUtils.removeInlineKeyboardOptions(bot, update);
  }
}
