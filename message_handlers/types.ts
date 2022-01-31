import TelegramBot, { Update } from "node-telegram-bot-api";

export interface MessageHandler {
    identifier: RegExp;
    handleMessage(bot: TelegramBot, update: Update): Promise<void>;
}