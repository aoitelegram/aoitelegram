export default {
  name: "$callback",
  callback: async (context) => {
    context.argsCheck(1);
    const [name, ...args] = context.splits;
    if (context.isError) return;

    if (!context.telegram.registerCallback.callbacks.has(name)) {
      context.sendError(`this callback '${name}' function does not exist`);
      return;
    }

    return await context.telegram.registerCallback.runCallback(
      name,
      args,
      context.event,
    );
  },
};
