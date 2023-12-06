export default {
  name: "$clientToken",
  callback: async (ctx, event, database, error) => {
    return event.telegram?.token;
  },
};
