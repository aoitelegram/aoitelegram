export default {
  name: "$sendMessage",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$sendMessage");
    const args = await ctx.getEvaluateArgs();
    return await event.send(args[0]);
  },
};
