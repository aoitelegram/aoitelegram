export default {
  name: "$clientCanJoinGroups",
  callback: async (ctx, event, database, error) => {
    const getMe = await event.telegram?.getMe();
    return getMe.can_join_groups;
  },
};
