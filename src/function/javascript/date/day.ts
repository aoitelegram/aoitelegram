export default {
  name: "$day",
  callback: async (ctx, event, database, error) => {
    return new Date().getDay();
  },
};
