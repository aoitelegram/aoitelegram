export default {
  name: "$isPremium",
  callback: (context) => {
    const isPremium =
      context.event.from?.is_premium ||
      context.event.message?.from.is_premium ||
      context.event.user?.is_premium;
    return isPremium;
  },
};
