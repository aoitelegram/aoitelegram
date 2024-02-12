export default {
  name: "$getTextSplitLength",
  callback: (context) => {
    if (context.isError) return;

    return context.array.get("splitText")?.length || 0;
  },
};
