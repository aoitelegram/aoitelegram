export default {
  name: "$textLastIndexOf",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$textLastIndexOf");
    const args = await ctx.getEvaluateArgs();
    return args[0].lastIndexOf(args[1]);
  },
};
