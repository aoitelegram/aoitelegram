export default {
  name: "$startsWith",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$startsWith");
    const args = await ctx.getEvaluateArgs();
    return `${args[0]}`.startsWith(args[1]);
  },
};
