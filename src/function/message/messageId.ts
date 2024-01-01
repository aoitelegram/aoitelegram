export default {
  name: "$messageId",
  callback: async (ctx, event, database, error) => {
    let messageId = event.message_id || event.message?.message_id;
    return messageId;
  },
};
