import TelegramBot, { Update } from "node-telegram-bot-api";

export function removeInlineKeyboardOptions(
  bot: TelegramBot,
  update: Update
): void {
  if (update && update.callback_query && update.callback_query.message) {
    bot.editMessageReplyMarkup(
      {
        inline_keyboard: [],
      },
      {
        chat_id: update.callback_query.message.chat.id,
        message_id: update.callback_query.message.message_id,
      }
    );
  }
}
