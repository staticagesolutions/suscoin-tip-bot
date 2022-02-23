import { ActiveAirdrop } from "@prisma/client";
import TelegramBot, { Update } from "node-telegram-bot-api";
import { activeAirdropService } from "services";

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

export async function cleanUpActiveAirdrop(
  activeAirdrop: ActiveAirdrop,
  bot: TelegramBot
): Promise<void> {
  const { chatId, messageId } = activeAirdrop;
  await activeAirdropService.removeActiveAirdrop(Number(messageId));
  if (chatId && messageId) {
    await bot.editMessageText("Airdrop has finished. 🥳🎉", {
      chat_id: Number(chatId),
      message_id: Number(messageId),
    });
    await bot.editMessageReplyMarkup(
      {
        inline_keyboard: [],
      },
      {
        chat_id: Number(chatId),
        message_id: Number(messageId),
      }
    );
  }
}
