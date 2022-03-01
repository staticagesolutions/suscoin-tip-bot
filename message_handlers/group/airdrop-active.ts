import { CallbackData } from "callback_handlers/enums";
import TelegramBot, { SendMessageOptions, Update } from "node-telegram-bot-api";
import { activeAirdropService, botMessageService } from "services";
import { MessageConfigI } from "services/bot-message-service";
import groupHandlerUtils from "./group-handler-utils";
export const createActiveAirdrop = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id, title },
    from,
    text,
    message_id,
  } = update.message!;

  const userId = from?.id;

  if (!userId) {
    console.error("No User Id!", update);
    throw new Error("No User Id found");
  }

  const isAdmin = await groupHandlerUtils.isAdmin(userId, id, bot);

  if (!isAdmin) {
    console.error("User is not an admin");
    return;
  }
  const sendMessageConfig: SendMessageOptions = {
    parse_mode: "Markdown",
  };

  const botMessageConfig: MessageConfigI = {
    bot,
    chatId: id,
    sendMessageConfig,
  };
  const tokens = (text ?? "").split(" ");

  const properSyntax = "Must be: `/active_airdrop <amount> <count>`";

  if (tokens.length !== 3) {
    await bot.sendMessage(
      id,
      `*Invalid Syntax*:\n${properSyntax}`,
      sendMessageConfig
    );
    return;
  }

  const [_, amountInText, countInText] = (text ?? "").split(" ");

  const amount = Number(amountInText);
  if (isNaN(amount) || amount <= 0) {
    await botMessageService.invalidAmountTextMsg(
      amountInText,
      botMessageConfig
    );
    return;
  }

  const count = Number(countInText);
  if (isNaN(count) || count <= 0) {
    await botMessageService.invalidAmountTextMsg(countInText, botMessageConfig);
    return;
  }

  const supportedToken = "SYS";

  const botMessage = await bot.sendMessage(
    id,
    `*An airdrop has been created.*\n*${amount} ${supportedToken}* will be shared among *${count}* lucky individual/s.\n\n_Join now for a chance to win ${supportedToken}!_`,
    {
      parse_mode: "Markdown",
      reply_to_message_id: message_id,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Join",
              callback_data: CallbackData.JoinAirdrop,
            },
          ],
          [
            {
              text: "Close",
              callback_data: CallbackData.CloseAirdrop,
            },
          ],
        ],
      },
    }
  );
  const activeAirdrop = await activeAirdropService.createActiveAirdrop(
    amount,
    count,
    botMessage
  );

  if (!activeAirdrop) {
    await bot.deleteMessage(
      botMessage.chat.id,
      botMessage.message_id.toString()
    );
    await bot.sendMessage(from!.id, `Failed to create an airdrop for ${title}`);
  }
};
