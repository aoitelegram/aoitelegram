export default {
  name: "$textLastIndexOf",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$textLastIndexOf")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].lastIndexOf(args[1]);
  },
};
