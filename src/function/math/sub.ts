export default {
  name: "$sub",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$sub");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["number", "number"]);

    return args[0] - args[1];
  },
};
