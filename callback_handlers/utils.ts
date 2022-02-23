import TelegramBot, { Update } from "node-telegram-bot-api";

export async function removeInlineKeyboardOptions(
  bot: TelegramBot,
  update: Update
): Promise<void> {
  const { chat, message_id } = update?.callback_query?.message!;
  if (chat.id && message_id) {
    await bot.editMessageReplyMarkup(
      {
        inline_keyboard: [],
      },
      {
        chat_id: chat.id,
        message_id: message_id,
      }
    );
  }
}
