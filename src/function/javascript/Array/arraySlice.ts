export default {
  name: "$arraySlice",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$arraySlice");
    const [arrayName, index = 1] = await ctx.getEvaluateArgs();

    if (!ctx.array.has(arrayName)) {
      error.errorArray(arrayName, "$arraySlice");
    }

    const array = ctx.array.get(arrayName);
    return array.slice(index >= 1 ? index - 1 : index + 1);
  },
};
