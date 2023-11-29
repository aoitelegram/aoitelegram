export default {
  name: "$var",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$var");
    const args = await ctx.getEvaluateArgs();

    return event.telegram?.globalVars.set(args[0], args[1]);
  },
};
