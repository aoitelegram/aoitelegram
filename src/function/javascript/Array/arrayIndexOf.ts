export default {
  name: "$arrayIndexOf",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$arrayIndexOf");
    const args = await ctx.getEvaluateArgs();

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arrayIndexOf");
    }

    const array = ctx.array.get(args[0]);
    return array.indexOf(args[1]);
  },
};
