export default {
  name: "$repeat",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string", "number"]);
    return args[0].repeat(args[1] - 1);
  },
};
