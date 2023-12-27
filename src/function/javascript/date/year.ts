export default {
  name: "$year",
  callback: async (ctx, event, database, error) => {
    return new Date().getFullYear();
  },
};
