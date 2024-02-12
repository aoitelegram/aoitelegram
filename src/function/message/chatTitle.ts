export default {
  name: "$chatTitle",
  callback: (context) => {
    let chatTitle =
      context.event.chat?.title || context.event.message?.chat.title;
    return chatTitle;
  },
};
