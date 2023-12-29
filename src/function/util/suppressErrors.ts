export default {
  name: "$suppressErrors",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$suppressErrors");
    const [text] = await ctx.getEvaluateArgs();
    ctx.suppressErrors = text;
  },
};
