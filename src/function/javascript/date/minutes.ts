export default {
  name: "$minutes",
  callback: async (ctx, event, database, error) => {
    return new Date().getMinutes();
  },
};
