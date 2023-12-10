export default {
  name: "$min",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$min");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["...number"]);

    return Math.min(...args);
  },
};
