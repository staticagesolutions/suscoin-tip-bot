import TelegramBot, { Update } from "node-telegram-bot-api";
import { CallbackData } from "./enums";

export interface CallbackHandler {
  callbackData: CallbackData;
  handleCallback(bot: TelegramBot, update: Update): Promise<void>;
}
