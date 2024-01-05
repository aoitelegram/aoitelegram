export default {
  name: "$messageId",
  callback: (context) => {
    let messageId =
      context.event.message_id || context.event.message?.message_id;
    return messageId;
  },
};
