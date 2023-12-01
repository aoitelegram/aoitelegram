export default {
  name: "$replyMessage",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    const callback_query = ctx.callback_query;
    ctx.callback_query = [];
    return await event.reply(
      args[0],
      callback_query
        ? { reply_markup: { inline_keyboard: callback_query } }
        : undefined,
    );
  },
};
