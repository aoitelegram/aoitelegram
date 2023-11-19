export default {
  name: "$textIndexOf",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$textIndexOf")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].indexOf(args[1]);
  },
};
