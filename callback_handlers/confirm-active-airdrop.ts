import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { CallbackData } from "./enums";
import { CallbackHandler } from "./types";
import web3 from "services/web3";
import { callbackUtils } from "callback_handlers";
import { WalletService } from "services/wallet-service";
import { cleanUpActiveAirdrop } from "./utils";
import { ActiveAirdropService } from "services/active-airdrop-service";

export class ActiveAirdropCallbackHandler implements CallbackHandler {
  constructor(
    private walletService: WalletService,
    private activeAirdropService: ActiveAirdropService
  ) {}
  callbackData = CallbackData.ConfirmAirdropTransaction;
  explorerLink = process.env.EXPLORER_LINK ?? "https://explorer.syscoin.org";

  async handleCallback(bot: TelegramBot, update: Update): Promise<void> {
    await callbackUtils.removeInlineKeyboardOptions(bot, update);
    const { message, id, from, data } = update.callback_query!;
    const sendMessageConfig: SendMessageOptions = {
      parse_mode: "Markdown",
    };

    const chatId = message!.chat!.id;

    const tokens = (message!.text ?? "").split(" ");
    const rawTransaction = tokens.pop();
    const messageId = data!.split(":").pop();

    if (!rawTransaction || !messageId) {
      bot.sendMessage(id, "Something went wrong.", sendMessageConfig);
      return;
    }
    const sendEvent = web3.eth.sendSignedTransaction(rawTransaction);

    const addressLink = `${this.explorerLink}/address`;

    await new Promise((resolve, reject) => {
      const txLink = `${this.explorerLink}/tx`;
      sendEvent
        .once("sent", async (_) => {
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
          const activeAirdrop =
            await this.activeAirdropService.getActiveAirdrop(Number(messageId));
          await cleanUpActiveAirdrop(activeAirdrop!, bot);
        })
        .once("receipt", async (receipt) => {
          const txHash = receipt.transactionHash;
          await bot.sendMessage(
            chatId,
            `Transaction was successful\n\nTxHash: ${txHash}\n\nOpen in [explorer](${txLink}/${txHash})`,
            {
              parse_mode: "Markdown",
              disable_web_page_preview: true,
            }
          );
          resolve(receipt);
        })
        .once("error", async (err) => {
          console.log(err.message);
          await bot.sendMessage(chatId, `${err.message}`);
          reject(err);
        });
    });
  }
}
