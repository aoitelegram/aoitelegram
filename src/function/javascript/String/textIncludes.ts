export default {
  name: "$textIncludes",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$textIncludes");
    const args = await ctx.getEvaluateArgs();

    return args[0].includes(args[1]);
  },
};
