export default {
  name: "$chatFirstName",
  callback: (context) => {
    let chatFirstName =
      context.event.chat?.first_name || context.event.message?.chat.first_name;
    return chatFirstName;
  },
};
