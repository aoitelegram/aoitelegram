export default {
  name: "$arrayConcat",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arrayConcat")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arrayConcat");
    }
    const array = ctx.array.get(args[0]);
    const text = args.shift();
    return array.concat(...args);
  },
};
