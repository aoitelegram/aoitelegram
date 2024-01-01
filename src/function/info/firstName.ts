export default {
  name: "$firstName",
  callback: async (ctx, event, database, error) => {
    const firstName =
      event.from.first_name ||
      event.message?.from.first_name ||
      event.user?.first_name;
    return firstName;
  },
};
