export default {
  name: "$clientUsername",
  callback: async (context) => {
    const getMe = await context.telegram.getMe();
    return getMe.username;
  },
};
