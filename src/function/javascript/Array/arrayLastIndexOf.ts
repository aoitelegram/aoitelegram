export default {
  name: "$arraLastIndexOf",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$arraLastIndexOf");
    const [arrayName, search] = await ctx.getEvaluateArgs();

    if (!ctx.array.has(arrayName)) {
      error.errorArray(arrayName, "$arraLastIndexOf");
    }

    const array = ctx.array.get(arrayName);
    return array.lastIndexOf(search);
  },
};
