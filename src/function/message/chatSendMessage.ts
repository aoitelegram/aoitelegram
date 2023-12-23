export default {
  name: "$chatSendMessage",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$chatSendMessage");
    const [chatId, content] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([chatId, content], error, [
      "number | string",
      "unknown",
    ]);
    return await event.telegram.sendMessage(chatId, content);
  },
};
