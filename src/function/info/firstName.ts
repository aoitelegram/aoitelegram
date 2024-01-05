export default {
  name: "$firstName",
  callback: (context) => {
    const firstName =
      context.event.from.first_name ||
      context.event.message?.from.first_name ||
      context.event.user?.first_name;
    return firstName;
  },
};
