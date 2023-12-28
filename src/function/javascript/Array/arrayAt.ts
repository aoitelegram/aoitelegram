export default {
  name: "$arrayAt",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$arrayAt");
    const [arrayName, index = 1] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([arrayName, index], error, ["unknown", "number"]);

    if (!ctx.array.has(arrayName)) {
      error.errorArray(arrayName, "$arrayAt");
    }
    const array = ctx.array.get(arrayName);
    return array[index - 1 >= 1 ? index - 1 : index - 1];
  },
};
