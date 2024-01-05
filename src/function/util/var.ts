export default {
  name: "$var",
  callback: (context) => {
    context.argsCheck(2);
    const [variable, value] = context.splits;
    if (context.isError) return;

    return context.telegram.globalVars.set(variable, value);
  },
};
