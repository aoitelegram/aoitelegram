export default {
  name: "$clientUsername",
  callback: async (ctx, event, database, error) => {
    const getMe = await event.telegram?.getMe();
    return getMe.username;
  },
};
