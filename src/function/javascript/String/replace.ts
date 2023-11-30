export default {
  name: "$replace",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(3, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);
    return args[0].replace(args[1], args[2]);
  },
};
