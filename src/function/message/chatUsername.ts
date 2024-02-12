export default {
  name: "$chatUsername",
  callback: (context) => {
    let chatUsername =
      context.event.chat?.username || context.event.message?.chat.username;
    return chatUsername;
  },
};
