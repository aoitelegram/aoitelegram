import { isValidChat } from "../helpers";

export default {
  name: "$chatSendMessage",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$chatSendMessage");
    const [chatId, content] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([chatId, content], error, [
      "number | string",
      "unknown",
    ]);

    if (!(await isValidChat(event, chatId))) {
      error.customError("Invalid Chat Id", "$chatSendMessage");
      return;
    }

    return await event.telegram.sendMessage(chatId, content);
  },
};
