export default {
  name: "$toLowerCase",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$toLowerCase");
    const args = await ctx.getEvaluateArgs();
    return args[0].toLowerCase();
  },
};
