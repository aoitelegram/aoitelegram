export default {
  name: "$textSlice",
  callback: (context) => {
    context.argsCheck(2);
    const [text, index] = context.splits;
    context.checkArgumentTypes(["unknown", "number"]);
    if (context.isError) return;

    return `${text}`.slice(index - 1 >= 1 ? index - 1 : index - 1 + 1);
  },
};
