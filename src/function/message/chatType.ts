export default {
  name: "$chatType",
  callback: (context) => {
    let chatType = context.event.chat?.type || context.event.message?.chat.type;
    return chatType;
  },
};
