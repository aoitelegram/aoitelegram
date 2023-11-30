export default {
  name: "$arrayJoin",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arrayJoin");
    }

    const array = ctx.array.get(args[0]);
    return array.join(args[1]);
  },
};
