export const data = {
  name: "$sendMessage",
  callback: async (ctx: any, event: any) => {
    const args = await ctx.evaluateArgs(ctx.getArgs());
    await event.send(args[0]);
    return "";
  },
};
