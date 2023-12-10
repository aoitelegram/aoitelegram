export default {
  name: "$toFixed",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$toFixed");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["number", "number | undefined"]);

    return args[0].toFixed(args[1] || 0);
  },
};
