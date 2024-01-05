export default {
  name: "$chartAt",
  callback: (context) => {
    context.argsCheck(2);
    const [text, index] = context.splits;
    context.checkArgumentTypes(["unknown", "number"]);
    if (context.isError) return;

    return `${text}`.charAt(index - 1);
  },
};
