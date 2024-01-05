export default {
  name: "$clientCanJoinGroups",
  callback: async (context) => {
    const getMe = await context.telegram.getMe();
    return getMe.can_join_groups;
  },
};
