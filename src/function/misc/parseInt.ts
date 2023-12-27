export default {
  name: "$parseInt",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$parseInt");
    const args = await ctx.getEvaluateArgs();
    return parseInt(args.join(" "));
  },
};
