export default {
  name: "$max",
  callback: (context) => {
    context.argsCheck(2);
    const args = context.splits;
    context.checkArgumentTypes(["...number"]);
    if (context.isError) return;

    return Math.max(...args);
  },
};
