export default {
  name: "$math",
  callback: (context) => {
    context.argsCheck(1);
    const evaluate = context.inside;
    if (context.isError) return;

    try {
      return eval(evaluate);
    } catch (err) {
      context.sendError("Failed to calculate");
      return;
    }
  },
};
