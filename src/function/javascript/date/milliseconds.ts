export default {
  name: "$milliseconds",
  callback: async (ctx, event, database, error) => {
    return new Date().getMilliseconds();
  },
};
