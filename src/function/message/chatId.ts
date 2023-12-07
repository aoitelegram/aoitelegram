export default {
  name: "$chatId",
  callback: async (ctx, event, database, error) => {
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string | number | undefined"]);
    let chatId = event.chat?.id || event.message?.chat.id;
    if (args[0]) {
      const result = await event.telegram
        .getChat(args[0])
        .catch(() => console.log);
      chatId = result.id || chatId;
    }
    return chatId;
  },
};
