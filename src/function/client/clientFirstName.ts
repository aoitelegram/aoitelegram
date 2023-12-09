export default {
  name: "$clientFirstName",
  callback: async (ctx, event, database, error) => {
    const getMe = await event.telegram?.getMe();
    return getMe.first_name;
  },
};
