export default {
  name: "$textConcat",
  callback: (context) => {
    context.argsCheck(2);
    const [text, ...args] = context.splits;
    if (context.isError) return;

    return `${text}`.concat(...args);
  },
};
