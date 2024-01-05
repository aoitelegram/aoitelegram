export default {
  name: "$checkContains",
  callback: (context) => {
    context.argsCheck(2);
    const [text, ...chars] = context.splits;
    if (context.isError) return;

    const result = chars.some((search) => text.includes(search));
    return result;
  },
};
