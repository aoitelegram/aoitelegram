export default {
  name: "$arrayAt",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arrayAt")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arrayAt");
    }
    const array = ctx.array.get(args[0]);
    return array.at(args[1] >= 1 ? args[1] - 1 : args[1]);
  },
};
