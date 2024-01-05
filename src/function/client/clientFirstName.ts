export default {
  name: "$clientFirstName",
  callback: async (context) => {
    const getMe = await context.telegram.getMe();
    return getMe.first_name;
  },
};
