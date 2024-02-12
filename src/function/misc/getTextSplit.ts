export default {
  name: "$getTextSplit",
  callback: (context) => {
    context.argsCheck(1);
    const index = Number(context.inside);
    if (context.isError) return;

    return index ? context.array.get("splitText")?.[index - 1] : undefined;
  },
};
