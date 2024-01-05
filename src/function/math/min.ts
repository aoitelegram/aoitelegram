export default {
  name: "$min",
  callback: (context) => {
    context.argsCheck(2);
    const args = context.splits;
    context.checkArgumentTypes(["...number"]);
    if (context.isError) return;

    return Math.min(...args);
  },
};
