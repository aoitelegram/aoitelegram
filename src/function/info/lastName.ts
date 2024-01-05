export default {
  name: "$lastName",
  callback: (context) => {
    const lastName =
      context.event.from?.last_name ||
      context.event.message?.from.last_name ||
      context.event.user?.last_name;
    return lastName;
  },
};
