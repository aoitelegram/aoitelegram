export default {
  name: "$pow",
  callback: (context) => {
    context.argsCheck(2);
    const args = context.splits;
    context.checkArgumentTypes(["number", "number"]);
    if (context.isError) return;

    return Math.pow(args[0], args[1]);
  },
};
