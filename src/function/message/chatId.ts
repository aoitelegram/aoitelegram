export default {
  name: "$chatId",
  callback: (context) => {
    let chatId = context.event.chat?.id || context.event.message?.chat.id;
    return chatId;
  },
};
