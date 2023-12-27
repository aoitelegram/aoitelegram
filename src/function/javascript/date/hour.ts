export default {
  name: "$hour",
  callback: async (ctx, event, database, error) => {
    return new Date().getHours();
  },
};
