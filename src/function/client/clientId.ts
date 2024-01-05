export default {
  name: "$clientId",
  callback: async (context) => {
    const getMe = await context.telegram.getMe();
    return getMe.id;
  },
};
