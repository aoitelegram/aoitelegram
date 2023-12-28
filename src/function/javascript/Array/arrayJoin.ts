export default {
  name: "$arrayJoin",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$arrayJoin");
    const [arrayName, sep = ", "] = await ctx.getEvaluateArgs();

    if (!ctx.array.has(arrayName)) {
      error.errorArray(arrayName, "$arrayJoin");
    }

    const array = ctx.array.get(arrayName);
    return array.join(sep);
  },
};
