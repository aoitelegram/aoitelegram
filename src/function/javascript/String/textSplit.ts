export default {
  name: "$textSplit",
  callback: (context) => {
    context.argsCheck(1);
    const [text, sep = " "] = context.splits;
    if (context.isError) return;

    context.array.set("splitText", text.split(sep));
    return;
  },
};
