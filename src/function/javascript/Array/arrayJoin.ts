export default {
  name: "$arrayJoin",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arrayJoin")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arrayJoin");
    }

    const array = ctx.array.get(args[0]);
    return array.join(args[1]);
  },
};
