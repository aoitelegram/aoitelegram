export default {
  name: "$chartAt",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string", "number"]);
    return args[0].charAt(args[1] - 1);
  },
};
