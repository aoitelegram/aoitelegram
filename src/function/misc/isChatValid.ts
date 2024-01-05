export default {
  name: "$isChatValid",
  callback: async (context) => {
    const [chatId = context.event.chat?.id || context.event.message?.chat.id] =
      context.splits;
    const getChat = await context.telegram.getChat(chatId).catch(() => null);
    return getChat ? true : false;
  },
};
