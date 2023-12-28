export default {
  name: "$arrayIndexOf",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$arrayIndexOf");
    const [arrayName, search] = await ctx.getEvaluateArgs();

    if (!ctx.array.has(arrayName)) {
      error.errorArray(arrayName, "$arrayIndexOf");
    }

    const array = ctx.array.get(arrayName);
    return array.indexOf(search);
  },
};
