export default {
  name: "$round",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["number"]);

    return Math.round(args[0]);
  },
};
