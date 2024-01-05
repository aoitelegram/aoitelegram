export default {
  name: "$sum",
  callback: (context) => {
    context.argsCheck(2);
    const args = context.splits;
    context.checkArgumentTypes(["number", "number"]);
    if (context.isError) return;

    return args[0] + args[1];
  },
};
