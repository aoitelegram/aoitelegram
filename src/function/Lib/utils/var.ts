export default {
  name: "$var",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$var")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    return event.telegram?.globalVars.set(args[0], args[1]);
  },
};
