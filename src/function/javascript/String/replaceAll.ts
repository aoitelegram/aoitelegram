export default {
  name: "$replaceAll",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(3, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);
    return args[0].replaceAll(args[1], args[2]);
  },
};
