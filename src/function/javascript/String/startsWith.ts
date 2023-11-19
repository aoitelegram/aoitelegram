export default {
  name: "$startsWith",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$startsWith")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].startsWith(args[1]);
  },
};
