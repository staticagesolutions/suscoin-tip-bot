import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { WalletService } from "services/wallet-service";
import web3 from "services/web3";
import { TransactionConfig } from "web3-core";
import { MessageHandler } from "./types";


export class TransferMessageHandler implements MessageHandler {
    
    identifier = /\/transfer .*/g;

    constructor(private walletService: WalletService) {}

    async handleMessage(bot: TelegramBot, update: Update): Promise<void> {
        const { message_id, chat: {id, username }, text } = update.message!;
        const sendMessageConfig: SendMessageOptions = { parse_mode: "Markdown", reply_to_message_id: message_id };;
        if(!username) {
            console.error("No username found.", update);
            return;
        }
        const wallet  = await this.walletService.getWallet(username);

        if(!wallet) {
            const message = "No wallet found.";
            console.error(message, update);
            await bot.sendMessage(id, message, sendMessageConfig)
            return;
        }

        const tokens = (text ?? '').split(' ');

        if(tokens.length !== 3) {
            await bot.sendMessage(id, `Invalid # of arguments found on: *\"${text}\"*`, sendMessageConfig);
            return;
        }

        const [_, address, amountInText] = (text ?? '').split(' ')

        if(!web3.utils.isAddress(address)) {
            await bot.sendMessage(id, `Invalid address found: *\"${address}\"*`, sendMessageConfig);
            return;
        }
        
        const amount = Number(amountInText);
        if(isNaN(amount) || amount <= 0) {
            await bot.sendMessage(id, `Invalid amount found: *\"${amountInText}\"*`, sendMessageConfig);
            return;
        }

        const transactionConfig: TransactionConfig = {
            to: address,
            value: amount,
            maxFeePerGas: 3000
        }
        const account = web3.eth.accounts.privateKeyToAccount(wallet.privateKey);
        
        const signedTransaction = await account.signTransaction(transactionConfig)

        bot.sendMessage(id, `Transaction Config: ${JSON.stringify(transactionConfig, undefined, ' ')}. \n\n\n Reply to this message with */confirm* \n\n\n [RAW Transaction: ${signedTransaction.rawTransaction}]`, sendMessageConfig)
    }
}