export default {
  name: "$textAt",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string", "number"]);
    return args[0].at(args[1] >= 1 ? args[1] - 1 : args[1]);
  },
};
