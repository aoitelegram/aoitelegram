export default {
  name: "$datestamp",
  callback: async (ctx, event, database, error) => {
    return Date.now();
  },
};
