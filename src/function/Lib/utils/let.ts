export default {
  name: "$let",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$let")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    return ctx.localVars.set(args[0], args[1]);
  },
};
