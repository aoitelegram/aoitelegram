export default {
  name: "$toUpperCase",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$toUpperCase");
    const args = await ctx.getEvaluateArgs();
    return args[0].toUpperCase();
  },
};
