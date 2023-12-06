export default {
  name: "$pi",
  callback: async (ctx, event, database, error) => {
    return Math.PI;
  },
};
