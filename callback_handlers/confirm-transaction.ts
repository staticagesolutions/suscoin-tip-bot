import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { CallbackData } from "./enums";
import { CallbackHandler } from "./types";
import web3 from "services/web3";
import { callbackUtils } from "callback_handlers";

export class ConfirmTransactionCallbackHandler implements CallbackHandler {
  callbackData = CallbackData.ConfirmTransaction;
  explorerLink = process.env.EXPLORER_LINK ?? "https://explorer.syscoin.org";

  async handleCallback(bot: TelegramBot, update: Update): Promise<void> {
    callbackUtils.removeInlineKeyboardOptions(bot, update);
    const { message, id } = update.callback_query!;
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

    sendEvent.on("sent", (payload) => {
      bot.answerCallbackQuery(id, {
        text: `The transaction has been sent to the network`,
      });
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
        `Transaction was successful\n\nTxHash: ${txHash}\n\n Open in [explorer](${txLink}/${txHash})`,
        {
          parse_mode: "Markdown",
        }
      );
    });
  }
}
