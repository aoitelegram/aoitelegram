export default {
  name: "$chatId",
  callback: async (ctx, event, database, error) => {
    let chatId = event.chat?.id || event.message?.chat.id;
    return chatId;
  },
};
