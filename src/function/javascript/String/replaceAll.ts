export default {
  name: "$replaceAll",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(3, error, "$replaceAll");
    const args = await ctx.getEvaluateArgs();
    return args[0].replaceAll(args[1], args[2]);
  },
};
