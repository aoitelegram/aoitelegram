export default {
  name: "$textIndexOf",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$textIndexOf");
    const args = await ctx.getEvaluateArgs();
    return `${args[0]}`.indexOf(args[1]);
  },
};
