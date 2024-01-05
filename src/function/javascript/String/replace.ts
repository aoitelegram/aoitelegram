export default {
  name: "$replace",
  callback: (context) => {
    context.argsCheck(3);
    const [text, replace, toReplace] = context.splits;
    if (context.isError) return;

    return `${text}`.replace(replace, toReplace);
  },
};
