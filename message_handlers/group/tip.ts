import TelegramBot, { Update } from "node-telegram-bot-api";

export const tip = async (bot: TelegramBot, update: Update) => {
  const {
    chat: { id },
    message_id,
    reply_to_message,
    from,
  } = update.message!;
  if (!reply_to_message) {
    await bot.sendMessage(
      id,
      `@${from?.username} reply to a message and use \`\/tip <amount>\`\\.`,
      {
        reply_to_message_id: message_id,
        parse_mode: "MarkdownV2",
      }
    );
    return;
  }
  const { message_id: replyMessageId, from: replyFrom } = reply_to_message;

  console.log("Reply to message", {
    message_id,
    replyMessageId,
    chatId: id,
    from,
  });
  const messageReply = `Successfully send 10 SYS to @${replyFrom?.username}`;
  await bot.sendMessage(id, messageReply, {
    reply_to_message_id: message_id,
  });
};
