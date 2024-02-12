export default {
  name: "$joinSplitText",
  callback: (context) => {
    context.argsCheck(1);
    const sep = context.inside;
    if (context.isError) return;

    const result = context.array.get("splitText") || [];
    return result.join(result);
  },
};
