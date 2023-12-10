export default {
  name: "$createArray",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$createArray");
    const args = await ctx.getEvaluateArgs();
    const args1 = args[0];
    const args2 = args.shift();
    return ctx.array.set(args1, [...args]).size;
  },
};
