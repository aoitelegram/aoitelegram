export default {
  name: "$createArray",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$createArray");
    const [arrayName, ...array] = await ctx.getEvaluateArgs();
    return ctx.array.set(arrayName, [...array]).size;
  },
};
