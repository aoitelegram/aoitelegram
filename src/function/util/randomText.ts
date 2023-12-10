export default {
  name: "$randomText",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$randomText");
    const args = await ctx.getEvaluateArgs();
    const randomIndex = Math.floor(Math.random() * args.length);

    return args[randomIndex];
  },
};
