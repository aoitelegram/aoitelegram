export const data = {
  name: "$client",
  callback: async (ctx: any, event: any) => {
    const args = await ctx.evaluateArgs(ctx.getArgs());
    const getMe = (await event.telegram?.getMe()) ?? event;
    return getMe[args[0]];
  },
};
