export default {
  name: "$toFixed",
  callback: (context) => {
    context.argsCheck(1);
    const [number, fixed = 0] = context.splits;
    context.checkArgumentTypes(["number", "number | undefined"]);
    if (context.isError) return;

    return number.toFixed(fixed);
  },
};
