import { getObjectKey } from "../parser";

export default {
  name: "$getChat",
  callback: async (context) => {
    const [
      chatId = context.event.chat?.id || context.event.message?.chat.id,
      path,
    ] = context.splits;
    const result = await context.telegram.getChat(chatId).catch(() => null);

    if (!result) {
      context.sendError("Invalid Chat Id");
      return;
    }

    return getObjectKey(result, path);
  },
};
