export default {
  name: "$arrayAt",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$arrayAt");
    const args = await ctx.getEvaluateArgs();

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arrayAt");
    }
    const array = ctx.array.get(args[0]);
    return array.at(args[1] >= 1 ? args[1] - 1 : args[1]);
  },
};
