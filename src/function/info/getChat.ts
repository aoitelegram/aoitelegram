import { getObjectKey } from "../parser";

export default {
  name: "$getChat",
  callback: async (ctx, event, database, error) => {
    const [chatId = event.chat?.id || event.message?.chat.id, path] =
      await ctx.getEvaluateArgs();
    const result = await event.telegram.getChat(chatId).catch(() => null);

    if (!result) {
      error.customError("Invalid Chat Id", "$getChat");
      return;
    }

    return path ? getObjectKey(result, path) : result;
  },
};
