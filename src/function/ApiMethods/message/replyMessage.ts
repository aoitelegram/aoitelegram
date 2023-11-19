export default {
  name: "$replyMessage",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$replyMessage")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return await event.reply(args[0]);
  },
};
