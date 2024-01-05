export default {
  name: "$jsEval",
  callback: async (context) => {
    context.argsCheck(1);
    const content = context.inside;
    if (context.isError) return;

    const evaluate = await context.telegram.evaluateCommand(
      context.fileName,
      content,
      event,
    );
    return eval(evaluate);
  },
};
