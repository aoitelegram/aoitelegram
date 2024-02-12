export default {
  name: "$concatTextSplit",
  callback: (context) => {
    context.argsCheck(1);
    const [...text] = context.splits;
    if (context.isError) return;

    const result = context.array.get("splitText");
    const toSet = Array.isArray(result) ? result.concat(...text) : [...text];
    context.array.set("splitText", toSet);
  },
};
