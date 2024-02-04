export default {
  name: "$callback",
  callback: async (context) => {
    context.argsCheck(1);
    const [name, ...args] = context.splits;
    if (context.isError) return;

    return await context.telegram.registerCallback.runCallback(
      name,
      args,
      context.event,
    );
  },
};
