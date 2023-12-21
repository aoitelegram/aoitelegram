export default {
  name: "$getChatMemberCount",
  callback: async (ctx, event, database, error) => {
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string | number | undefined"]);
    const chatId = args[0] ?? event.chat?.id ?? event.message?.chat.id;
    return (
      (await event.telegram
        .getChatMemberCount(chatId)
        .catch((err) => console.log(err))) || 0
    );
  },
};
