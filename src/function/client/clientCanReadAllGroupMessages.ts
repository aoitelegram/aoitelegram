export default {
  name: "$clientCanReadAllGroupMessages",
  callback: async (context) => {
    const getMe = await context.telegram.getMe();
    return getMe.can_read_all_group_messages;
  },
};
