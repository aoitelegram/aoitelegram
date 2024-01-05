export default {
  name: "$username",
  callback: (context) => {
    const username =
      context.event.from?.username ||
      context.event.message?.from.username ||
      context.event.user?.username;
    return username;
  },
};
