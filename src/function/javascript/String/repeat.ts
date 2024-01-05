export default {
  name: "$repeat",
  callback: (context) => {
    context.argsCheck(2);
    const [text, count] = context.splits;
    context.checkArgumentTypes(["unknown", "number"]);
    if (context.isError) return;

    return `${text}`.repeat(count - 1);
  },
};
