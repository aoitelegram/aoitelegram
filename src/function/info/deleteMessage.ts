import { isValidChat } from "../helpers";

export default {
  name: "$deleteMessage",
  callback: async (ctx, event, database, error) => {
    const [
      chatId = event.chat?.id || event.message?.chat.id,
      messageId = event.message_id || event.message?.message_id,
    ] = await ctx.getEvaluateArgs();

    if (!(await isValidChat(event, chatId))) {
      error.customError("Invalid Chat Id", "$deleteMessage");
      return;
    }

    const result = await event.telegram
      .deleteMessage(chatId, messageId)
      .catch(() => undefined);

    return result;
  },
};
