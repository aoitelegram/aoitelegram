export default {
  name: "clientCanReadAllGroupMessages",
  callback: async (ctx, event, database, error) => {
    const getMe = await event.telegram?.getMe();
    return getMe.can_read_all_group_messages;
  },
};
