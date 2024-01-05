export default {
  name: "$fromID",
  callback: (context) => {
    const fromID =
      context.event.from?.id ||
      context.event.message?.from.id ||
      context.event.user?.id;
    return fromID;
  },
};
