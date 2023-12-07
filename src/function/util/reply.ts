export default {
  name: "$reply",
  callback: async (ctx, event, database, error) => {
    const [reply = true] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([reply], error, ["boolean"]);
    ctx.replyMessage = reply;
    return undefined;
  },
};
