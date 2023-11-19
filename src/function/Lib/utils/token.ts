export default {
  name: "$token",
  callback: async (ctx, event, database, error) => {
    return event.telegram?.token;
  },
};
