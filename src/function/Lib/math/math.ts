export default {
  name: "$math",
  callback: async (ctx, event, database, error) => {
    const args = await ctx.evaluateArgs(ctx.getArgs());
    try {
      return eval(args[0]);
    } catch (err) {
      return error.customError("Failed to calculate in", "$math");
    }
  },
};
