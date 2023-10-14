export const data = {
  name: "$replyMessage",
  callback: async (ctx: any, event: any) => {
    const args = await ctx.evaluateArgs(ctx.getArgs());
    await event.reply(args[0]);
    return "";
  },
};
