export default {
  name: "$toString",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$toString");
    const args = await ctx.getEvaluateArgs();
    return `${args[0]}`;
  },
};
