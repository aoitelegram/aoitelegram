export default {
  name: "$languageCode",
  callback: (context) => {
    const languageCode =
      context.event.from?.language_code ||
      context.event.message?.from.language_code ||
      context.event.user?.language_code;
    return languageCode;
  },
};
