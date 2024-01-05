export default {
  name: "$let",
  callback: (context) => {
    context.argsCheck(2);
    const [variable, value] = context.splits;
    if (context.isError) return;

    return context.localVars.set(variable, value);
  },
};
