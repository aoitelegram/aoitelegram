export default {
  name: "$split",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$split")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].split(args[1]);
  },
};
