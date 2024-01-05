import { isValidChat } from "../helpers";

export default {
  name: "$deleteMessage",
  callback: async (context) => {
    const [
      chatId = context.event.chat?.id || context.event.message?.chat.id,
      messageId = context.event.message_id || context.event.message?.message_id,
    ] = context.splits;

    if (!(await isValidChat(context.event, chatId))) {
      context.sendError("Invalid Chat Id");
      return;
    }

    const result = await context.telegram
      .deleteMessage(chatId, messageId)
      .catch(() => "");

    return result;
  },
};
