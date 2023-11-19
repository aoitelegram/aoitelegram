export default {
  name: "$print",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$print")) return;
    console.log(...(await ctx.evaluateArgs(ctx.getArgs())));
    return undefined;
  },
};
