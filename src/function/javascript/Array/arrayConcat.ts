export default {
  name: "$arrayConcat",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$arrayConcat");
    const [arrayName, arrayConcat] = await ctx.getEvaluateArgs();

    if (!ctx.array.has(arrayName[0])) {
      error.errorArray(arrayName[0], "$arrayConcat");
    }

    const array = ctx.array.get(arrayName[0]);
    return array.concat(...arrayConcat);
  },
};
