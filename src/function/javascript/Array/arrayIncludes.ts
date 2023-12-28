export default {
  name: "$arrayIncludes",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$arrayIncludes");
    const [arrayName, search] = await ctx.getEvaluateArgs();

    if (!ctx.array.has(arrayName)) {
      error.errorArray(arrayName, "$arrayIncludes");
    }

    const array = ctx.array.get(arrayName);
    return array.includes(search);
  },
};
