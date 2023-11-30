export default {
  name: "$textConcat",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);
    const text = args.shift();
    return text.concat(...args);
  },
};
