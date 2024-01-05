export default {
  name: "$getMyDescription",
  callback: async (context) => {
    const language_code = context.inside;
    const result = await context.telegram
      .getMyDescription(language_code)
      .catch(() => "");

    return result;
  },
};
