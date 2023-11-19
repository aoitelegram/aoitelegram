export default {
  name: "$ping",
  callback: async (ctx, event) => {
    return await event.telegram?.ping();
  },
};
