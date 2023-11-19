export default {
  name: "$createArray",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$createArray")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    const args1 = args[0];
    const args2 = args.shift();
    return ctx.array.set(args1, [...args]).size;
  },
};
