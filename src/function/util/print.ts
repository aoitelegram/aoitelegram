export default {
  name: "$print",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    console.log(...(await ctx.getEvaluateArgs()));
    return undefined;
  },
};
