export default {
  name: "$editTextSplitIndex",
  callback: (context) => {
    context.argsCheck(2);
    const [index, text] = context.splits;
    if (context.isError) return;

    const result = context.array.get("splitText") || [];
    const resultIndex = result.indexOf(+index) + 1;

    if (!resultIndex) {
      context.sendError(`Invalid Index`);
      return;
    }

    result[resultIndex] = text;
    context.array.set("splitText", result);

    return;
  },
};
