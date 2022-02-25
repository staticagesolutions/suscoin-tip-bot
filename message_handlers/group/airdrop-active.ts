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

  const username = from!.username;
  if (!username) {
    console.error("No username found.", update);
    return;
  }
  const isAdmin = await groupHandlerUtils.isAdmin(username, id, bot);

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

  if (tokens.length !== 2) {
    await botMessageService.invalidArgumentLengthMsg(
      `${text}`,
      botMessageConfig
    );
    return;
  }

  const [_, amountInText] = (text ?? "").split(" ");

  const amount = Number(amountInText);
  if (isNaN(amount) || amount <= 0) {
    await botMessageService.invalidAmountTextMsg(
      amountInText,
      botMessageConfig
    );
    return;
  }

  const botMessage = await bot.sendMessage(
    id,
    `*An airdrop has been created.*\nAmount: _${amount} SYS_\n\nJoin Now!`,
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