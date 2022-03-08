import { ActiveAirdrop } from "@prisma/client";
import TelegramBot, { Update } from "node-telegram-bot-api";
import { activeAirdropService } from "services";
import { getAirdropWinners, getContractAddressLink } from "shared/utils";

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
  bot: TelegramBot,
  tokens: string[]
): Promise<void> {
  const { chatId, messageId } = activeAirdrop;

  const nChatId = Number(chatId);
  const nMessageId = Number(messageId);
  await activeAirdropService.removeActiveAirdrop(Number(messageId));
  if (chatId && messageId) {
    const winnerAddresses = await getAirdropWinners(tokens);
    const link = getContractAddressLink();
    await bot.sendMessage(nChatId, `Winners:\n${winnerAddresses}\n\n${link}`, {
      reply_to_message_id: nMessageId,
      disable_web_page_preview: true,
    });
    await bot.editMessageText("Airdrop has finished. 🥳🎉", {
      chat_id: nChatId,
      message_id: nMessageId,
    });
    await bot.editMessageReplyMarkup(
      {
        inline_keyboard: [],
      },
      {
        chat_id: nChatId,
        message_id: nMessageId,
      }
    );
  }
}
