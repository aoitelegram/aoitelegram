export default {
  name: "$textIndexOf",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);
    return args[0].indexOf(args[1]);
  },
};
