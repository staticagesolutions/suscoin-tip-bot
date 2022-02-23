import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { ActiveAirdropService } from "services/active-airdrop-service";
import {
  BotMessageService,
  MessageConfigI,
} from "services/bot-message-service";
import { CallbackData } from "./enums";
import { CallbackHandler } from "./types";

export class JoinAirdropCallbackHandler implements CallbackHandler {
  constructor(
    private botMessageService: BotMessageService,
    private activeAirdropService: ActiveAirdropService
  ) {}
  callbackData = CallbackData.JoinAirdrop;
  async handleCallback(bot: TelegramBot, update: Update): Promise<void> {
    const callbackQuery = update.callback_query!;

    if (!callbackQuery) {
      throw new Error("Callback Query not found");
    }
    const { message, from } = callbackQuery;
    const chatId = message!.chat.id;
    const chatTitle = message!.chat.title;
    const username = from!.username;
    const userId = from!.id;
    const sendMessageConfig: SendMessageOptions = {
      parse_mode: "Markdown",
    };

    const botMessageConfig: MessageConfigI = {
      bot,
      chatId: from!.id,
      sendMessageConfig,
    };

    if (!username) {
      await this.botMessageService.noUsernameMsg(botMessageConfig);
      return;
    }
    const administrators = await bot.getChatAdministrators(chatId);

    const isAdmin = administrators.find((admin) => {
      return admin.user.username === username;
    });
    if (isAdmin) {
      return;
    }

    const isRegistered = await this.activeAirdropService.isRegisteredToAirdrop(
      callbackQuery
    );

    if (isRegistered) {
      await bot.sendMessage(
        userId,
        `Already registered to ${chatTitle}'s airdrop`
      );
      return;
    }

    const joined = await this.activeAirdropService.registerToActiveAirdrop(
      callbackQuery
    );

    if (!joined) {
      bot.sendMessage(userId, `Failed to register to ${chatTitle}'s airdrop`);
      return;
    }

    bot.sendMessage(userId, `You have participated to ${chatTitle}'s airdrop!`);
  }
}
