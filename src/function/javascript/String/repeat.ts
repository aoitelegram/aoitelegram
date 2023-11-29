export default {
  name: "$repeat",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$repeat");
    const args = await ctx.getEvaluateArgs();
    return args[0].repeat(args[1] - 1);
  },
};
