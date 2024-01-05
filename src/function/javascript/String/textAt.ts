export default {
  name: "$textAt",
  callback: (context) => {
    context.argsCheck(2);
    const [text, index] = context.splits;
    if (context.isError) return;

    return `${text}`[index - 1 < 0 ? text.length + index - 1 : index - 1];
  },
};
