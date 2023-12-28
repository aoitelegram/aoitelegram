export default {
  name: "$isChatValid",
  callback: async (ctx, event, database, error) => {
    const [chatId = event.chat?.id || event.message?.chat.id] =
      await ctx.getEvaluateArgs();
    const getChat = await event.telegram.getChat(chatId).catch(() => null);
    return getChat ? true : false;
  },
};
