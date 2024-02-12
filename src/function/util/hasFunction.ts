export default {
  name: "$hasFunction",
  callback: (context) => {
    context.argsCheck(1);
    const func = context.inside;
    if (context.isError) return;

    return context.telegram.availableFunctions.has(func);
  },
};
