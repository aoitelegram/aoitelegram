export default {
  name: "$isDM",
  callback: async (context) => {
    const [chatId = context.event.chat?.id || context.event.message?.chat.id] =
      context.splits;
    const getChat = await context.event.telegram
      .getChat(chatId)
      .catch(() => null);
    return getChat ? getChat.type === "private" : false;
  },
};
