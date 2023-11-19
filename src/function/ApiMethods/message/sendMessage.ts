export default {
  name: "$sendMessage",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$sendMessage")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return await event.send(args[0]);
  },
};
