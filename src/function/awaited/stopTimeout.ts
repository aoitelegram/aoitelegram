export default {
  name: "$stopTimeout",
  callback: async (context) => {
    context.argsCheck(1);
    const timeoutId = context.inside;
    if (context.isError) return;

    const result =
      await context.telegram.timeoutManager.removeTimeout(timeoutId);
    return result;
  },
};
