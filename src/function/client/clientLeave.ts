export default {
  name: "$clientLeave",
  callback: async (ctx, event, database, error) => {
    const [chatId = event.chat?.id || event.message?.chat.id] =
      await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([chatId], error, ["string | number | undefined"]);
    const result = await event.telegram.leaveChat(chatId).catch(() => null);

    if (!result) {
      error.customError("Invalid Chat Id", "$clientLeave");
    }

    return result;
  },
};
