export default {
  name: "$replace",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(3, error, "$replace");
    const args = await ctx.getEvaluateArgs();
    return args[0].replace(args[1], args[2]);
  },
};
