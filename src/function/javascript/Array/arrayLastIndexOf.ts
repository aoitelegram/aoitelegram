export default {
  name: "$arraLastIndexOf",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arraLastIndexOf")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arraLastIndexOf");
    }

    const array = ctx.array.get(args[0]);
    return array.lastIndexOf(args[1]);
  },
};
