export default {
  name: "$client",
  callback: async (ctx, event, database, error) => {
    const args = await ctx.getEvaluateArgs();
    const getMe = (await event.telegram?.getMe()) ?? event;
    return getMe[args[0]];
  },
};
