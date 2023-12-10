export default {
  name: "$arrayIncludes",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$arrayIncludes");
    const args = await ctx.getEvaluateArgs();

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arrayIncludes");
    }

    const array = ctx.array.get(args[0]);
    return array.includes(args[1]);
  },
};
