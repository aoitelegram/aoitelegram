export default {
  name: "$getChatMemberCount",
  callback: async (ctx, event, database, error) => {
    const [chatId = event.chat?.id || event.message?.chat.id] =
      await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([chatId], error, ["string | number | undefined"]);
    const result = await event.telegram
      .getChatMemberCount(chatId)
      .catch((err) => null);

    if (!result) {
      error.customError("Invalid Chat Id", "$getChatMemberCount");
      return;
    }

    return result;
  },
};
