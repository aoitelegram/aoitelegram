export default {
  name: "$jsEval",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const content = await ctx.getEvaluateArgs();
    const evaluate = await event.telegram.evaluateCommand(
      ctx.fileName,
      content.join(", "),
      event,
    );
    return eval(evaluate);
  },
};
