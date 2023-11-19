export default {
  name: "$textConcat",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$textConcat")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    const text = args.shift();
    return text.concat(...args);
  },
};
