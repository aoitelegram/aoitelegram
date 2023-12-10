export default {
  name: "$print",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$print");
    console.log(...(await ctx.getEvaluateArgs()));
    return undefined;
  },
};
