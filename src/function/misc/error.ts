export default {
  name: "$error",
  callback: (context) => {
    context.argsCheck(1);
    const [text, custom = false] = context.splits;
    if (context.isError) return;

    return context.sendError(text, custom);
  },
};
