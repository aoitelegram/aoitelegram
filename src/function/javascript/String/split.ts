export default {
  name: "$split",
  callback: (context) => {
    context.argsCheck(2);
    const [text, sep = ", "] = context.splits;
    if (context.isError) return;

    return `${text}`.split(sep);
  },
};
