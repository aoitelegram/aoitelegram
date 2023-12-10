export default {
  name: "$textTrim",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$textTrim");
    const args = await ctx.getEvaluateArgs();
    return `${args[0]}`.trim();
  },
};
