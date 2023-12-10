export default {
  name: "$max",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$max");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["...number"]);

    return Math.max(...args);
  },
};
