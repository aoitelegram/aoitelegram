export default {
  name: "$chatIsForum",
  callback: (context) => {
    let chatIsForum =
      context.event.chat?.is_forum || context.event.message?.chat.is_forum;
    return chatIsForum;
  },
};
