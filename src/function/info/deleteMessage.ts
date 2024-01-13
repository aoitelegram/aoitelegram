export default {
  name: "$deleteMessage",
  callback: async (context) => {
    const [
      chatId = context.event.chat?.id || context.event.message?.chat.id,
      messageId = context.event.message_id || context.event.message?.message_id,
    ] = context.splits;

    const result = await context.telegram.deleteMessage(chatId, messageId);

    return result;
  },
};
