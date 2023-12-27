export default {
  name: "$parseFloat",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$parseFloat");
    const args = await ctx.getEvaluateArgs();
    return parseFloat(args.join(" "));
  },
};
