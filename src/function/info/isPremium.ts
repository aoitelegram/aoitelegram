export default {
  name: "$isPremium",
  callback: async (ctx, event, database, error) => {
    const isPremium =
      event.from?.is_premium ||
      event.message?.from.is_premium ||
      event.user?.is_premium;
    return isPremium;
  },
};
