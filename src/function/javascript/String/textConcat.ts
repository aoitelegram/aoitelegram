export default {
  name: "$textConcat",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$textConcat");
    const args = await ctx.getEvaluateArgs();
    const text = args.shift();
    return text.concat(...args);
  },
};
