export default {
  name: "$endsWith",
  callback: (context) => {
    context.argsCheck(2);
    if (context.isError) return;

    const [text, search] = context.splits;
    return `${text}`.endsWith(search);
  },
};
