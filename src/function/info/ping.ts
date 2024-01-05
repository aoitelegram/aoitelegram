export default {
  name: "$ping",
  callback: async (context) => {
    return await context.telegram.ping();
  },
};
