export default {
  name: "$clientId",
  callback: async (ctx, event, database, error) => {
    const getMe = await event.telegram?.getMe();
    return getMe.id;
  },
};
