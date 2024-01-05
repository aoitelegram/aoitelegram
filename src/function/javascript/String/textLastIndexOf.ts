export default {
  name: "$textLastIndexOf",
  callback: (context) => {
    context.argsCheck(2);
    const [text, search] = context.splits;
    if (context.isError) return;

    return `${text}`.lastIndexOf(search);
  },
};
