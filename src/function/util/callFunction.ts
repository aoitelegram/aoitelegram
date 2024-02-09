export default {
  name: "$callFunction",
  callback: (context) => {
    context.argsCheck(1);
    const [name, ...args] = context.splits;
    if (context.isError) return;

    const func = context.telegram.availableFunctions.get(name);

    if (!func || !func.callback) {
      context.sendError(`The specified function "${name}" does not exist (only js)`);
      return;
    }

    context.splits = args;
    return func.callback.call(context);
  },
};
