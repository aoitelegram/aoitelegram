export default {
  name: "$charCount",
  callback: (context) => {
    context.argsCheck(1);
    const [text, findChar] = context.splits;
    if (context.isError) return;

    return findChar
      ? (text.split(findChar).length - 1) * findChar.length
      : text.length;
  },
};
