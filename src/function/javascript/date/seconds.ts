export default {
  name: "$seconds",
  callback: async (ctx, event, database, error) => {
    return new Date().getSeconds();
  },
};
