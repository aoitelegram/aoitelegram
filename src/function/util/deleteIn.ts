export default {
  name: "$deleteIn",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    const chatId = event.chat.id ?? event.message?.chat.id;
    const messageId = event.message_id ?? event.message?.message_id;
    setTimeout(() => {
      event.deleteMessage(args[1] ?? messageId).catch(() => console.log);
    }, args[0] * 1000);
    return undefined;
  },
};
