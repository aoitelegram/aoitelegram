export default {
  name: "$languageCode",
  callback: async (ctx, event, database, error) => {
    const languageCode =
      event.from?.language_code ||
      event.message?.from.language_code ||
      event.user?.language_code;
    return languageCode;
  },
};
