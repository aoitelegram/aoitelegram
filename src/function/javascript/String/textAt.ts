export default {
  name: "$textAt",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$textAt");
    const args = await ctx.getEvaluateArgs();
    return `${args[0]}`[args[1] - 1 < 0 ? args[0].length + args[1] - 1 : args[1] - 1];
  },
};
