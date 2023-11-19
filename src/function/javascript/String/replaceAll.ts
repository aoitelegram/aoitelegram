export default {
  name: "$replaceAll",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(3, true, error, "$replaceAll")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].replaceAll(args[1], args[2]);
  },
};
