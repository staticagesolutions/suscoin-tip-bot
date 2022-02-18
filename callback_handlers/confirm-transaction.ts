import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { CallbackData } from "./enums";
import { CallbackHandler } from "./types";
import web3 from "services/web3";
import { callbackUtils } from "callback_handlers";
import { WalletService } from "services/wallet-service";

export class ConfirmTransactionCallbackHandler implements CallbackHandler {
  constructor(private walletService: WalletService) {}
  callbackData = CallbackData.ConfirmTransaction;
  explorerLink = process.env.EXPLORER_LINK ?? "https://explorer.syscoin.org";

  async handleCallback(bot: TelegramBot, update: Update): Promise<void> {
    callbackUtils.removeInlineKeyboardOptions(bot, update);
    const { message, id, from } = update.callback_query!;
    const sendMessageConfig: SendMessageOptions = {
      parse_mode: "Markdown",
    };

    const chatId = message!.chat!.id;

    const tokens = (message!.text ?? "").split(" ");
    const rawTransaction = tokens.pop();

    if (!rawTransaction) {
      bot.sendMessage(id, "Something went wrong.", sendMessageConfig);
      return;
    }

    const sendEvent = web3.eth.sendSignedTransaction(rawTransaction);

    const addressLink = `${this.explorerLink}/address`;
    sendEvent.on("sent", async (_) => {
      const username = from.username!;
      const walletAddress = (await this.walletService.getWallet(username))
        ?.address;
      await bot.sendMessage(
        chatId,
        `The transaction has been sent to the network.\n[Check pending transactions](${addressLink}/${walletAddress})`,
        {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }
      );
    });

    sendEvent.on("error", (err) => {
      console.log(err.message);
      bot.sendMessage(chatId, `${err.message}`);
    });

    const txLink = `${this.explorerLink}/tx`;
    sendEvent.on("receipt", async (receipt) => {
      const txHash = receipt.transactionHash;
      bot.sendMessage(
        chatId,
        `Transaction was successful\n\nTxHash: ${txHash}\n\nOpen in [explorer](${txLink}/${txHash})`,
        {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }
      );
    });
  }
}
