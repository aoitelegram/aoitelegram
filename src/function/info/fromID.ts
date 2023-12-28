export default {
  name: "$fromID",
  callback: async (ctx, event, database, error) => {
    const fromID = event.from?.id || event.message?.from.id;
    return fromID;
  },
};
