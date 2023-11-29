export default {
  name: "$textSlice",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$textSlice");
    const args = await ctx.getEvaluateArgs();
    return args[0].slice(args[1] >= 1 ? args[1] - 1 : args[1] + 1);
  },
};
