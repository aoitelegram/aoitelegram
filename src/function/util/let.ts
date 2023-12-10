export default {
  name: "$let",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$let");
    const args = await ctx.getEvaluateArgs();

    return ctx.localVars.set(args[0], args[1]);
  },
};
