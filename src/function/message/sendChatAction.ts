import { isValidChat } from "../helpers";

export default {
  name: "$sendChatAction",
  callback: async (ctx, event, database, error) => {
    const chat = event.chat?.id || event.message?.chat.id;
    const [action = "typing", chatId = chat] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([action, chatId], error, [
      "string",
      "number | string",
    ]);

    if (!(await isValidChat(event, chatId))) {
      error.customError("Invalid Chat Id", "$sendChatAction");
      return;
    }

    event.telegram.sendChatAction({
      chat_id: chatId,
      action,
    });
    return undefined;
  },
};
