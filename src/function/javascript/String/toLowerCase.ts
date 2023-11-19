export default {
  name: "$toLowerCase",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$toLowerCase")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].toLowerCase();
  },
};
