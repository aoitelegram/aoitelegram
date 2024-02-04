export default {
  name: "$cropText",
  callback: (context) => {
    context.argsCheck(1);
    const [text, limit = 2000, start = 0, char = ""] = context.splits;
    if (context.isError) return;

    const result = text.trim().split(char).slice(+start, +limit).join(char);

    return result;
  },
};
