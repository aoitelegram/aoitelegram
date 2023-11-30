export default {
  name: "$arrayConcat",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arrayConcat");
    }
    const array = ctx.array.get(args[0]);
    const text = args.shift();
    return array.concat(...args);
  },
};
