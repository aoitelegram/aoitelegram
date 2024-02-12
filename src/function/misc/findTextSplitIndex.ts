export default {
  name: "$findTextSplitIndex",
  callback: (context) => {
    context.argsCheck(1);
    const query = context.inside;
    if (context.isError) return;

    return context.array.get("splitText")?.indexOf(+query) + 1;
  },
};
