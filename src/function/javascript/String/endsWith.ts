export default {
  name: "$endsWith",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$endsWith")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].endsWith(args[1]);
  },
};
