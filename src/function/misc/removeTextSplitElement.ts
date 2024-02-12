export default {
  name: "$removeTextSplitElement",
  callback: (context) => {
    context.argsCheck(1);
    const [...elements] = context.inside;
    if (context.isError) return;

    const result = context.array.get("splitText") || [];

    for (const element of elements) {
      const resultIndex = result.indexOf(+element);

      if (resultIndex !== -1) {
        result.splice(resultIndex, 1);
      }
    }

    context.array.set("splitText", result);
    return;
  },
};
