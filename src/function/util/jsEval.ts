export default {
  name: "$jsEval",
  callback: async (context) => {
    context.argsCheck(1);
    const content = context.inside;
    if (context.isError) return;

    const command = context.command.command
      ? context.command.name
      : { event: context.command.name };
    const evaluate = await context.telegram.evaluateCommand(
      command,
      content,
      event,
    );
    return eval(evaluate);
  },
};
