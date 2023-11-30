export default {
  name: "$math",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    try {
      return eval(args[0]);
    } catch (err) {
      return error.customError("Failed to calculate in", "$math");
    }
  },
};
