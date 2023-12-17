export default {
  name: "$isDM",
  callback: async (ctx, event, database, error) => {
    const [chatId = event.chat?.id || event.message?.chat.id] =
      await ctx.getEvaluateArgs();
    try {
      const getChat = await event.telegram.getChat(chatId);
      return getChat.type === "private";
    } catch (err) {
      return false;
    }
  },
};
